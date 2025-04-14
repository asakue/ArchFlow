import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState({
    firstName: "Алексей",
    lastName: "Иванов",
    email: "a.ivanov@example.com",
    phone: "+7 (910) 123-45-67",
    position: "Главный архитектор",
    bio: "Опытный системный архитектор с 10-летним стажем в разработке корпоративных решений."
  });

  const [notifications, setNotifications] = useState({
    emails: true,
    approvals: true,
    comments: true,
    changes: false,
    system: true
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    fontSize: "default",
    density: "default",
    language: "ru"
  });

  const handleProfileUpdate = () => {
    toast({
      title: "Профиль обновлен",
      description: "Изменения в профиле успешно сохранены",
    });
  };

  const handleNotificationsUpdate = () => {
    toast({
      title: "Настройки уведомлений обновлены",
      description: "Изменения в настройках уведомлений успешно сохранены",
    });
  };

  const handleAppearanceUpdate = () => {
    toast({
      title: "Внешний вид обновлен",
      description: "Настройки интерфейса успешно применены",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Настройки</h1>
        <p className="text-neutral-600">Управление настройками и персонализация системы</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Персональные данные</CardTitle>
                  <CardDescription>
                    Обновите вашу личную информацию
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input 
                        id="firstName" 
                        value={userProfile.firstName}
                        onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input 
                        id="lastName" 
                        value={userProfile.lastName}
                        onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input 
                      id="phone" 
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input 
                      id="position" 
                      value={userProfile.position}
                      onChange={(e) => setUserProfile({...userProfile, position: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea 
                      id="bio"
                      rows={4}
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleProfileUpdate}>Сохранить изменения</Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Фото профиля</CardTitle>
                  <CardDescription>
                    Обновите фото вашего профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src="/avatars/03.png" alt="User profile" />
                    <AvatarFallback className="text-3xl">
                      {userProfile.firstName[0]}{userProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full mt-4">
                    <Button variant="outline" className="w-full mb-2">
                      <i className="ri-upload-2-line mr-2"></i>
                      Загрузить новое фото
                    </Button>
                    <Button variant="ghost" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                      <i className="ri-delete-bin-line mr-2"></i>
                      Удалить фото
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Укажите, какие уведомления вы хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email-уведомления</Label>
                  <p className="text-neutral-500 text-sm">Получать уведомления на email</p>
                </div>
                <Switch 
                  checked={notifications.emails}
                  onCheckedChange={(checked) => setNotifications({...notifications, emails: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Запросы на согласование</Label>
                  <p className="text-neutral-500 text-sm">Уведомлять о новых запросах на согласование</p>
                </div>
                <Switch 
                  checked={notifications.approvals}
                  onCheckedChange={(checked) => setNotifications({...notifications, approvals: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Комментарии</Label>
                  <p className="text-neutral-500 text-sm">Уведомлять о новых комментариях к проектам</p>
                </div>
                <Switch 
                  checked={notifications.comments}
                  onCheckedChange={(checked) => setNotifications({...notifications, comments: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Изменения в проектах</Label>
                  <p className="text-neutral-500 text-sm">Уведомлять об изменениях в проектах, где вы участвуете</p>
                </div>
                <Switch 
                  checked={notifications.changes}
                  onCheckedChange={(checked) => setNotifications({...notifications, changes: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Системные уведомления</Label>
                  <p className="text-neutral-500 text-sm">Важные обновления системы и технические оповещения</p>
                </div>
                <Switch 
                  checked={notifications.system}
                  onCheckedChange={(checked) => setNotifications({...notifications, system: checked})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNotificationsUpdate}>Сохранить настройки</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Внешний вид</CardTitle>
              <CardDescription>
                Настройка интерфейса системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Тема оформления</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-md p-4 cursor-pointer hover:bg-neutral-50 ${appearance.theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setAppearance({...appearance, theme: 'light'})}
                  >
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 bg-white border rounded-full flex items-center justify-center">
                        <i className="ri-sun-line text-yellow-500"></i>
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium">Светлая</p>
                  </div>

                  <div 
                    className={`border rounded-md p-4 cursor-pointer hover:bg-neutral-50 ${appearance.theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setAppearance({...appearance, theme: 'dark'})}
                  >
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 bg-neutral-800 border rounded-full flex items-center justify-center">
                        <i className="ri-moon-line text-yellow-200"></i>
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium">Темная</p>
                  </div>

                  <div 
                    className={`border rounded-md p-4 cursor-pointer hover:bg-neutral-50 ${appearance.theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setAppearance({...appearance, theme: 'system'})}
                  >
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-white to-neutral-800 border rounded-full flex items-center justify-center">
                        <i className="ri-computer-line text-primary"></i>
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium">Системная</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Размер шрифта</Label>
                <Select 
                  value={appearance.fontSize}
                  onValueChange={(value) => setAppearance({...appearance, fontSize: value})}
                >
                  <SelectTrigger id="fontSize">
                    <SelectValue placeholder="Выберите размер шрифта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Маленький</SelectItem>
                    <SelectItem value="default">Стандартный</SelectItem>
                    <SelectItem value="large">Большой</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="density">Плотность интерфейса</Label>
                <Select 
                  value={appearance.density}
                  onValueChange={(value) => setAppearance({...appearance, density: value})}
                >
                  <SelectTrigger id="density">
                    <SelectValue placeholder="Выберите плотность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Компактная</SelectItem>
                    <SelectItem value="default">Стандартная</SelectItem>
                    <SelectItem value="comfortable">Комфортная</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Язык интерфейса</Label>
                <Select 
                  value={appearance.language}
                  onValueChange={(value) => setAppearance({...appearance, language: value})}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAppearanceUpdate}>Применить настройки</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>
                Настройки безопасности учетной записи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Смена пароля</Label>
                <div className="space-y-4">
                  <Input type="password" placeholder="Текущий пароль" />
                  <Input type="password" placeholder="Новый пароль" />
                  <Input type="password" placeholder="Подтверждение нового пароля" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Двухфакторная аутентификация</Label>
                  <p className="text-neutral-500 text-sm">Повысьте безопасность вашей учетной записи</p>
                </div>
                <Button variant="outline">Настроить</Button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>История активности</Label>
                  <p className="text-neutral-500 text-sm">Просмотр истории входов в систему</p>
                </div>
                <Button variant="outline">Просмотреть</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Сохранить настройки безопасности</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;