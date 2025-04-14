import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const MemStoreFactory = MemoryStore(session);
const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    if (!stored || !stored.includes(".")) {
      console.log("Stored password doesn't contain salt separator");
      return false;
    }
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.log("Invalid stored password format");
      return false;
    }

    console.log("Comparing password:");
    console.log("Stored hash:", hashed);

    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    // For debugging, output the supplied password hash
    console.log("Supplied hash:", suppliedBuf.toString("hex"));

    // Check if the buffers are equal
    const isEqual = hashedBuf.length === suppliedBuf.length && timingSafeEqual(hashedBuf, suppliedBuf);
    console.log("Password comparison result:", isEqual);

    return isEqual;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "archflow-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemStoreFactory({
      checkPeriod: 86400000 // очистка каждые 24 часа
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Authenticating user:", username);

        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("User not found:", username);
          return done(null, false);
        }

        console.log("User found, checking password");

        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          console.log("Invalid password for user:", username);
          return done(null, false);
        }

        console.log("Authentication successful for:", username);
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });


  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, fullName, avatar, role, organizationId } = req.body;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
      }

      const hashedPassword = await hashPassword(password);

      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        avatar: avatar || null,
        role: role || "user",
        organizationId: organizationId || null,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", req.body.username);
    console.log("Request body:", req.body);

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }

      if (!user) {
        console.log("Authentication failed for user:", req.body.username);
        return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
      }

      console.log("User authenticated successfully:", user.username);

      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    res.json(req.user);
  });
}