import { Router, getExpressRouter } from "./framework/router";

import { User, WebSession } from "./app";
import { WebSessionDoc } from "./concepts/websession";
import { ObjectId } from "mongodb";

class Routes {
  // Get the currently logged in user
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  // Get all users
  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  // Get a user by username
  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  // Create a user
  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  // Change the password of the currently logged in user
  @Router.post("/password")
  async changePassword(session: WebSessionDoc, oldPassword: string, password: string) {
    const user = WebSession.getUser(session);
    return await User.updatePassword(user, oldPassword, password);
  }

  // Delete the currently logged in user
  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  // Log in
  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  // Log out
  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }
}

export default getExpressRouter(new Routes());
