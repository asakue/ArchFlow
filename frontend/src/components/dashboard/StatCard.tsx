import React from "react";

type TrendProps = {
  value: string;
  direction: "up" | "down" | "neutral";
  text: string;
};

type StatCardProps = {
  title: string;
  value: number | string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: TrendProps;
  isLoading?: boolean;
};

export const StatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  isLoading = false,
}: StatCardProps) => {
  const hasData = value !== undefined && value !== null && value !== 0 && value !== "Нет данных" && value !== "";
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-neutral-200 rounded w-28"></div>
            <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
          </div>
          <div className="h-8 w-16 bg-neutral-200 rounded"></div>
          <div className="h-4 w-36 bg-neutral-200 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor}`}>
              <i className={`${icon} text-xl ${iconColor}`}></i>
            </div>
          </div>

          <div className="mt-3 mb-2">
            <p className="text-2xl font-semibold">
              {hasData ? value : "Нет данных"}
            </p>
          </div>

          {trend && (
            <div
              className={`text-xs flex items-center ${
                trend.direction === "up"
                  ? "text-green-600"
                  : trend.direction === "down"
                  ? "text-red-600"
                  : "text-neutral-500"
              }`}
            >
              <i
                className={`${
                  trend.direction === "up"
                    ? "ri-arrow-up-s-line"
                    : trend.direction === "down"
                    ? "ri-arrow-down-s-line"
                    : "ri-more-line"
                } mr-1`}
              ></i>
              <span>
                {trend.value} {trend.text}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};