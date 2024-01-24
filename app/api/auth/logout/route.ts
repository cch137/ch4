import authNext from "../../../../server/auth-next";

function handle() {
  return authNext.logout();
}

export {
  handle as GET,
  handle as POST,
}
