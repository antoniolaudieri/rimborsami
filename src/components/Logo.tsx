import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
  className?: string;
  linkTo?: string;
}

const sizeMap = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
  xl: "w-16 h-16",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-xl",
  xl: "text-2xl",
};

const Logo = ({
  size = "md",
  showText = true,
  textClassName,
  className,
  linkTo = "/",
}: LogoProps) => {
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={logoImage}
        alt="Rimborsami Logo"
        className={cn(sizeMap[size], "object-contain")}
      />
      {showText && (
        <span
          className={cn(
            "font-display font-bold text-gradient-hero",
            textSizeMap[size],
            textClassName
          )}
        >
          Rimborsami
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
};

export default Logo;
