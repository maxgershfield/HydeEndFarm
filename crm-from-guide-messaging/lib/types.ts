export interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  body: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface Conversation {
  phone: string
  memberName: string
  messages: Message[]
  lastMessageAt: string | null
  unreadCount: number
}

export interface ConversationSummary {
  phone: string
  memberName: string
  lastMessageAt: string | null
  unreadCount: number
  lastMessage: Message | null
}

export interface Member {
  fingerprintId: string
  name: string
  phone: string | null
  chapter: string
  lastMessageAt: string | null
  unreadCount: number
  messageCount: number
}

export interface Automation {
  id: string
  name: string
  description: string
  enabled: boolean
  inactiveDays?: number
  karmaThreshold?: number
  message: string
}

export interface BroadcastEntry {
  id: string
  sentAt: string
  filter: string
  recipientCount: number
  message: string
}

export interface Stats {
  memberCount: number
  sentToday: number
  openConversations: number
  totalUnread: number
  broadcastsToday: number
}
