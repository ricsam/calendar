import { Button, type ButtonProps } from "@mui/material";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import React from "react";

/**
 * MUI `Button` rendered as an anchor so it can be driven by TanStack Router.
 * Keeps the router's type-safe `to` prop instead of a raw `href`.
 */
const MuiButtonAnchor = React.forwardRef<
  HTMLAnchorElement,
  Omit<ButtonProps<"a">, "href">
>((props, ref) => <Button component="a" ref={ref} {...props} />);
MuiButtonAnchor.displayName = "MuiButtonAnchor";

const CreatedButtonLink = createLink(MuiButtonAnchor);

export const ButtonLink: LinkComponent<typeof MuiButtonAnchor> = (props) => (
  <CreatedButtonLink {...props} />
);
