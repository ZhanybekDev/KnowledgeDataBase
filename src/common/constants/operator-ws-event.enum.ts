export enum OperatorWsEvent {
  SET_USER_PARAMETERS = "set_user_parameters",
  CHANGE_USER_STATE = "change_user_state",

  /*
   * CONTACT
   */
  ACCEPT_CONTACT = "accept_contact",
  END_CONTACT = "end_contact",
  CHANGE_CONTACT_STATE = "change_contact_state",
  TRANSFER_CONTACT = "transfer_contact",
  BREAK_TRANSFER_CONTACT = "break_transfer_contact",
  GET_CLIENT_HISTORY = "get_client_history",
  UPDATE_CONTACT_STATUS = "update_contact_status",

  GET_INTERACTIONS = "get_interactions",

  SAVE_QUESTIONNAIRE = "save_questionnaire",
  SAVE_TECHNICAL_WORKS = "save_technical_works",

  /*
   * REQUESTS
   */
  GET_REQUEST_SCHEME = "get_request_scheme",
  ACTIVATE_REQUEST = "activate_request",
  GET_REQUEST_VIEWS = "get_request_views",
  GET_CLIENT_ACTIVE_REQUESTS = "get_client_active_requests",
  SELECT_REQUEST_REASON = "select_request_reason",
  SEARCH_QUESTIONS = "search_questions",
  GET_CLIENT_REQUEST_SCHEME = "get_client_request_scheme",
  CANCEL_REASON = "cancel_reason",
  DELETE_REQUEST = "delete_request",
  ESCALATE_CLIENT_REQUEST = "escalate_client_request",
  GET_CLIENT_PREDICTIONS = "get_client_predictions",

  GET_SPLIT_LINKS = "get_split_links",

  SEND_NOTIFICATION = "send_notification",

  INIT_CLIENT = "init_client",

  GET_ACTUAL_TECHNICAL_WORKS = "get_actual_technical_works",

  GET_NAUMEN_USER_PASSWORD = "get_naumen_user_password",

  DELETE_USER_CONNECTION = "delete_user_connection",
  GET_USER_CONNECTIONS = "get_user_connections",

  CREATE_ISSUE = "create_issue",
  CREATE_COMMENT = "create_comment",
  CANCEL_REASON_WITH_COMMENT = "cancel_reason_with_comment",

  GET_LAST_REQUESTS = "get_last_requests",
  GET_CLIENT_REQUEST = "get_client_request",
}
