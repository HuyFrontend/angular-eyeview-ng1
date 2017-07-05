import page from "./page/page";
import main from "./main/main";
import navbar from "./navbar/navbar";
import aside from "./aside/aside";
import signin from "./signin/signin";
import home from "./home/home";
import authorize from "./authorize/index";
import auth from "./auth/index";
import clearToken from "./clearToken/index";
import forgotPassword from "./forgotPassword/forgotPassword";
import resetPassword from "./resetPassword/resetPassword";
import manageUser from "./manageUser/manageUser";
import watchlist from "./watchlist/watchlist";
import manageCamera from "./manageCamera/manageCamera";
import changePassword from "./changePassword/changePassword";
import cctv from "./cctv/cctv";
let module = angular.module('app.modules', [
  page.name,
  main.name,
  navbar.name,
  aside.name,
  signin.name,
  home.name,
  authorize.name, //done
  auth.name, //done
  clearToken.name, //done
  forgotPassword.name, //done
  resetPassword.name,//done
  manageUser.name,
  watchlist.name,
  manageCamera.name,
  changePassword.name,
  cctv.name,
]);

export default module;
