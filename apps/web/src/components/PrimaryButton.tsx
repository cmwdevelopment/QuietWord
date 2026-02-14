// PrimaryButton - Glassmorphism CTA component for QuietWord

import React from "react";
import { motion } from "motion/react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
  fullWidth = false,
  size = "md",
}: PrimaryButtonProps) {
  const baseStyles =
    "rounded-xl transition-all font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background relative overflow-hidden inline-flex items-center justify-center backdrop-blur-xl";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };
  
  const variantStyles = {
    primary: 
      "bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary shadow-lg hover:shadow-xl disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50",
    secondary: 
      "bg-secondary text-secondary-foreground border border-glass-border hover:bg-secondary-hover focus:ring-primary shadow-md hover:shadow-lg disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50",
    ghost: 
      "bg-transparent text-foreground hover:bg-glass-bg border border-glass-border focus:ring-primary hover:border-border",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} disabled:cursor-not-allowed`}
    >
      {/* Shimmer effect overlay */}
      {!disabled && variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
