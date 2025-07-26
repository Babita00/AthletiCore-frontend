export const LOGIN_URL = "/user/login";
export const REGISTER_URL = "/user/register";
export const CREATE_EVENT_URL = "/event/create";
export const GET_MY_EVENT_URL = "/event/my-events";
export const GET_EVENT_URL = "/event/";
export const GET_EVENT_BY_ID_URL = "/event/:eventId";
export const DELETE_EVENT_URL = "/event/:eventId";
export const UPDATE_EVENT_URL = "/event/:eventId";

// export const GET_EVENT_BY_ID_URL = "/event/{id}";
export const CREATE_ANNOUNCEMENT_URL = "/announcement/";
export const GET_ANNOUNCEMENT_URL = "/announcement";
// Add announcement update and delete URLs
export const UPDATE_ANNOUNCEMENT_URL = "/announcement";
export const DELETE_ANNOUNCEMENT_URL = "/announcement";
// custom form,
export const CREATE_EVENT_FORM_URL = "/form-events/:eventId/forms";
//register for event
export const SUBMIT_EVENT_FORM_URL = "/form-events/:eventId/submissions";
//get registration data
export const GET_ALL_EVENT_REGISTRATION_FORM_URL =
  "/form-events/:eventId/submissions";
export const GET_EVENT_REGISTRATION_BY_ID_FORM_URL =
  "/form-events/:eventId/submissions/:submissionId";
export const GET_MY_EVENT_REGISTRATION_FORM_URL =
  "/form-events/:eventId/submissions/me";

//lift attempts
export const INITIALIZE_ATTEMPTS = "/attempt/init-lifts";
// constants/url/liftAttemptUrls.ts
export const GET_LIFT_ATTEMPTS_URL = "/attempt";
export const SUBMIT_NEXT_WEIGHT_URL = "/attempt/:attemptId/submit-weight";
export const UPDATE_LIFT_STATUS_URL = "/attempt/:attemptId/update-status";

//
export const GET_LIVE_SCOREBOARD_URL = "/live-scoreboard/live/:eventId";
