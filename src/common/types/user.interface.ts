export interface State {
  code?: string,
  title: string,
  color: string,
  date: string | Date,
}

export interface IUserState {
  state: State,
  availableStates: State[]
}

export enum EnumSide {
  user = "user",
  client = "client",
  bot = "bot",
  system = "system"
}

export enum EnumRole {
  user = "user",
  supervisor = "supervisor",
  admin = "admin",
}

export interface IUser {
  [key: string]: string | number | EnumRole | object | undefined,
  id: number,
  first_name: string,
  last_name: string,
  login: string,
  nickname: string,
  avatar_id: number
  role: EnumRole
  params?: {
    distribution: {
      lowLimit: number,
      highLimit: number,
      correlation: number
    }
  }
  user_splits?: any[]
}

export interface IProject {
  [key: string]: string | number,
  id: number,
  title: string,
  created_at: string,
  updated_at: string,
  created_by: number,
  updated_by: number,
}

export interface IUserProject {
  [key: string]: string | number | IUser | IProject,
  id: number,
  user_id: number,
  split_id: number,
  created_at: string,
  updated_at: string,
  user: IUser,
  project: IProject,
  priority: number
}

export interface IBot {
  [key: string]: string | number,
  id: number,
  title: string,
  bot_platform: string,
  created_at: string,
  updated_at: string
}

export enum UserWsEvent {
  OK = 'ok',
  CHANGE_USER_STATE = 'change_user_state',
  END_CHAT = 'end_chat',
  TRANSFER_CHAT = 'transfer_chat',
  SEND_MESSAGE = 'send_message',
  GET_ACTIVE_USERS = 'get_active_users',
  GET_PREVIOUS_CHAT = 'get_previous_chat',
  CREATE_TEMPLATE = 'create_template',
  INCREMENT_TEMPLATE_INTERACTION = 'increment_template_interaction',
  MESSAGE_READ = 'message_read',
  GET_CLOSED_CONTACTS = 'get_closed_contacts',
  WATCH_ACTIVE_TAB = 'watch_active_tab',
  CLOSE_ACTIVE_TAB = 'close_active_tab',
  UPLOAD = 'upload',
  UNBLOCK_CHAT = 'unblock_chat',

  GET_ALL_USERS = 'get_all_users',
  GET_ALL_PROJECTS = 'get_all_project',
  GET_ALL_USER_SPLITS = 'get_all_user_splits',
  GET_ALL_BOTS = 'get_all_bots',
  GET_ALL_SPLITS = 'get_all_splits',
  CONNECT_WEBHOOK = 'connect_webhook',

  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',

  GET_USER = 'get_user',

  GET_CONTACT_FROM_CRON = 'get_contact_from_cron',
  REOPEN_CONTACT = 'reopen_contact',
  JOIN_TO_USER_STATE_ROOM = 'join_to_user_state_room',
  LEAVE_FROM_USER_STATE_ROOM = 'leave_from_user_state_room',
  JOIN_TO_EXCHANGE_ROOM = 'join_to_exchange_room',
  LEAVE_FROM_EXCHANGE_ROOM = 'leave_from_exchange_room',
  GET_EXCHANGES = 'get_exchanges',
  DELETE_EXCHANGE = 'delete_exchange',
  EXCHANGE_CONTACTS = 'exchange_contacts',

  ACTIVE_CHAT = 'active_chat',
  CHANGE_USER_LIMITS = 'change_user_limits',
  GET_MESSAGE_BY_ID = 'get_message_by_id',
  GET_MESSAGES_BEFORE_CONTEXT = 'get_messages_before_context',

  GET_CONTACT_MESSAGES_BY_CONTACT_ID = 'get_contact_messages_by_contact_id',

  HOLD_CHAT = 'hold_chat',
  UNLOCK_CHAT = 'unlock_chat',
  GET_HOLDS_BY_CHAT_ID = 'get_holds_by_chat_id'
}

export enum UserWsResponse {
  RECENT_CHAT = 'recent_chat',
  OK = 'ok',
  USER_DATA = 'user_data',
  CHAT = 'chat',
  SPLIT = 'split',
  CHANNEL = 'channel',
  ACTIVE_USERS = 'active_users',
  TAG = 'tag',
  TEMPLATES = 'templates',
  TEMPLATE = 'template',
  CLOSED_CHATS = 'closed_chats',
  ALL_CHATS = 'all_chats',
  MESSAGE = 'message',
  PREVIOUS_CHAT = 'previous_chat',
  CHAT_TRANSFERRED = 'chat_transferred',

  ALL_USERS = 'all_users',
  ALL_PROJECTS = 'all_project',
  ALL_USER_SPLITS = 'all_user_splits',
  ALL_BOTS = 'all_bots',
  ALL_SPLITS = 'all_splits',

  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  ERROR = 'exception',
  WEBHOOK_CONNECTION_SUCCESS = 'webhook_connection_success',

  USER = 'user',
  CHAT_ASSIGNEE = 'chat_assignee',
  CHAT_WITH_MESSAGES = 'chat_with_messages',
  CRON_STATE = 'cron_state',
  CONTACT_FROM_CRON = 'contact_from_cron',
  CHAT_EXIST = 'chat_exist',
  CHAT_TRANSFER_ERROR = 'chat_transfer_error',

  CREATE_EXCHANGE = 'create_exchange',
  CREATED_EXCHANGE = 'created_exchange',
  ALL_ACTIVE_EXCHANGES = 'all_active_exchanges',
  NEW_EXCHANGE = 'new_exchange',
  INVALID_EXCHANGE = 'invalid_exchange',
  GLOBAL_NOTIFICATION = 'global_notification',
  TAB_DATA_DOWNLOADED = 'tab_data_downloaded',
  GET_ACTIVE_CHAT = 'get_active_chat',
  CHANGE_USER_STATE_BY_ADMIN = 'change_user_state_by_admin',
  LOGOUT_USER_FROM_SYSTEM = 'logout_user_from_system',
  MESSAGE_BY_ID = 'message_by_id',
  MESSAGES_BEFORE_CONTEXT = "messages_before_context",
  CONTACT_MESSAGES_BY_CONTACT_ID = 'contact_messages_by_contact_id',
  HOLD = 'hold',
  UNLOCK_HOLD = 'unlock_hold',
  HOLDS_BY_CHAT_ID = 'holds_by_chat_id'
}
