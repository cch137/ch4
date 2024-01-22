import authNext from "../../services/auth-next";

function handle() {
  return authNext.logout();
}

export {
  handle as GET,
  handle as POST,
}
