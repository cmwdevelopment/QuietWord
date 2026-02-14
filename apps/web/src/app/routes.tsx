// Routes configuration for QuietWord

import { createBrowserRouter } from "react-router";
import { Home } from "../pages/Home";
import { Onboarding } from "../pages/Onboarding";
import { Settle } from "../pages/Settle";
import { Reader } from "../pages/Reader";
import { Notes } from "../pages/Notes";
import { Settings } from "../pages/Settings";
import { SignIn } from "../pages/SignIn";
import ThemePreview from "../pages/ThemePreview";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/signin",
    Component: SignIn,
  },
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/settle/:section",
    Component: Settle,
  },
  {
    path: "/reader/:section",
    Component: Reader,
  },
  {
    path: "/notes",
    Component: Notes,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/theme-preview",
    Component: ThemePreview,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
