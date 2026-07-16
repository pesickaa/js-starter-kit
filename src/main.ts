import "./style.css";
import createKindeClient, { type KindeUser } from "@kinde-oss/kinde-auth-pkce-js";

const loggedInViews = document.getElementsByClassName("js-logged-in-view");
const loggedOutViews = document.getElementsByClassName("js-logged-out-view");

const switchViews = (a: HTMLCollectionOf<Element>, b: HTMLCollectionOf<Element>) => {
  [...a].forEach((v) => v.removeAttribute("hidden"));
  [...b].forEach((v) => v.setAttribute("hidden", "true"));
};

const renderLoggedInView = (user: KindeUser) => {
  const namePlaceholder = document.querySelector(".js-user-name");
  const avatarPlaceholder = document.querySelector(".js-user-avatar");
  const avatarPicturePlaceholder = document.querySelector<HTMLImageElement>(
    ".js-user-avatar-picture"
  );
  if (namePlaceholder) {
    namePlaceholder.textContent = `${user.given_name} ${user?.family_name || ""}`;
  }

  if (`${user.picture}` != "" && avatarPicturePlaceholder) {
    avatarPicturePlaceholder.src = `${user.picture}`;
    avatarPicturePlaceholder.removeAttribute("hidden");
  } else if (avatarPlaceholder && user.given_name) {
    avatarPlaceholder.textContent = `${user.given_name[0]}${
      user?.family_name?.[0] || user.given_name[1]
    }`;
    avatarPlaceholder.removeAttribute("hidden");
  }

  switchViews(loggedInViews, loggedOutViews);
};

const renderLoggedOutView = () => {
  const loggedInViews = document.getElementsByClassName("js-logged-in-view");
  const loggedOutViews = document.getElementsByClassName("js-logged-out-view");
  switchViews(loggedOutViews, loggedInViews);
};

const render = async (user: KindeUser | null | undefined) => {
  if (user) {
    renderLoggedInView(user);
  } else {
    renderLoggedOutView();
  }
};

const kinde = await createKindeClient({
  client_id: import.meta.env.VITE_KINDE_CLIENT_ID,
  domain: import.meta.env.VITE_KINDE_DOMAIN,
  redirect_uri: import.meta.env.VITE_KINDE_REDIRECT_URL,
});

type KindeAction = "login" | "register" | "logout";

const addKindeEvent = (id: KindeAction) => {
  document.getElementById(id)?.addEventListener("click", async () => {
    await kinde[id]();
  });
};

(["login", "register", "logout"] as const).forEach(addKindeEvent);

// Handle page load
const user = await kinde.getUser();
await render(user);
