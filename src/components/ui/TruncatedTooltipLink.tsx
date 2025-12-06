import React, { useState, useLayoutEffect, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

// The component now accepts props for the <a> tag directly
interface TruncatedTooltipLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text: string;
}

export function TruncatedTooltipLink({
  text,
  ...props
}: TruncatedTooltipLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      const element = linkRef.current;
      if (element) {
        setIsTruncated(element.scrollWidth > element.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  // The <a> tag is now rendered directly inside this component
  const link = (
    <a ref={linkRef} {...props}>
      {text}
    </a>
  );

  if (isTruncated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
