export enum OperatorWsResponse {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  CONNECT_ERROR = "connect_error",

  USER_DATA = "user_data",

  USER_STATE = "user_state",
  CLIENT_HISTORY = "client_history",
  CLIENT_HISTORY_ADD = "client_history_add",
  CONTACT = "contact",
  CONTACTS = "contacts",
  CONTACT_STATE = "contact_state",
  SPLIT_LINKS = "split_links",
  SPLITS = "splits",
  PROJECTS = "projects",
  CONTACT_STATUSES = "contact_statuses",
  CONTACT_STATUS = "contact_status",
  CLIENT_PREDICTIONS = "client_predictions",
  ACTIVE_CONTACT = "active_contact",

  INTERACTIONS = "interactions",
  FILLED_QUESTIONNAIRE = "filled_questionnaire",
  FILLED_TECHNICAL_WORK = "filled_technical_work",

  // Requests

  REQUEST_VIEWS = "request_views",
  REQUEST_SCHEME = "request_scheme",
  CLIENT_ACTIVE_REQUESTS = "client_active_requests",
  FOUNDED_QUESTIONS = "founded_questions",
  CLIENT_REQUEST_SCHEME = "client_request_scheme",
  CLIENT_ACTIVE_REQUEST = "client_active_request",
  UPDATE_CLIENT_REQUEST = "update_client_request",
  DELETE_CLIENT_REQUEST = "delete_client_request",
  ESCALATION_CLIENT_REQUEST = "escalation_client_request",
  CANCEL_REASON = "cancel_reason",

  TOAST_MESSAGE = "toast_message",

  NOTIFICATION = "notification",

  UPDATE_CLIENT_PREDICTION = "update_client_prediction",

  ACTUAL_TECHNICAL_WORKS = "actual_technical_works",

  NAUMEN_USER_PASSWORD = "naumen_user_password",

  FORM_FIELDS = "form_fields",
  OPEN_FORM_JIRA = "open_form_jira",
  GET_ISSUE_KEY = "get_issue_key",
  IS_AUTO_FILLED = "is_auto_filled",

  CREATE_ISSUE_RESPONSE = "create_issue_response",

  USER_CONNECTIONS = "connected_users",
  CONNECTED_USER = "connected_user",
  DISCONNECTED_USER = "disconnected_user",

  LAST_REQUESTS = "last_requests",
}
