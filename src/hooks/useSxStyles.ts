import { useTheme, type Theme } from "@mui/material";
import { type SxProps, type SystemStyleObject } from "@mui/system";
import { useMemo } from "react";
import customTheme from "src/config/theme";

type SxStylesReturn<T> = {
  [k in keyof T]: SxProps<Theme>;
};

type Styles<T> = {
  [K in keyof T]: SystemStyleObject<Theme>;
};

export const makeSxStyles = <T extends {}>(
  stylesCreator: (theme: Theme) => Styles<T>
): ((theme: Theme) => SxStylesReturn<T>) => {
  return (theme: Theme): SxStylesReturn<T> => {
    const styles = stylesCreator(theme);
    const sxStyles: SxStylesReturn<T> = {} as SxStylesReturn<T>;

    for (const key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        sxStyles[key] = styles[key];
      }
    }

    return sxStyles;
  };
};

export const makeStyles = <T extends {}>(stylesCreator: (theme: Theme) => Styles<T>): Styles<T> => {
  const styles = stylesCreator(customTheme);
  const sxStyles: Styles<T> = {} as Styles<T>;
  for (const key in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      sxStyles[key] = styles[key];
    }
  }
  return sxStyles;
};

const useSxStyles = <T extends {}>(stylesCreator: (theme: Theme) => Styles<T>): SxStylesReturn<T> => {
  const theme = useTheme();
  return useMemo(() => makeSxStyles<T>(stylesCreator)(theme), [theme, stylesCreator]);
};

export default useSxStyles;
