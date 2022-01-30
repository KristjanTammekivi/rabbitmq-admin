type ClusterState = 'running' | string;

export type Vhost = {
    cluster_state: Record<string, ClusterState>;
    description: string;
    metadata: {
        description: string;
        tags: string[];
    };
    name: string;
    tags: string[];
    tracing: boolean;
};

export interface PermissionsObject {
    configure: string;
    write: string;
    read: string;
}

export interface Permissions extends PermissionsObject {
    user: string;
    vhost: string;
}

export interface Consumer {
    arguments: Record<string, any>;
    ack_required: boolean;
    active: boolean;
    activity_status: 'up' | string;
    channel_details: {
        connection_name: string;
        name: string;
        node: string;
        number: number;
        peer_host: string;
        peer_port: number;
        user: string;
    };
    consumer_tag: string;
    exclusive: boolean;
    prefetch_count: number;
    queue: {
        name: string;
        vhost: string;
    };
}

/*
  {
    arguments: {},
    auto_delete: true,
    backing_queue_status: {
      avg_ack_egress_rate: 1.4529717457877265,
      avg_ack_ingress_rate: 1.4529717457877265,
      avg_egress_rate: 1.4529717457877265,
      avg_ingress_rate: 1.4529717457877265,
      delta: [Array],
      len: 0,
      mode: 'default',
      next_seq_id: 2619,
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      target_ram_count: 'infinity'
    },
    consumer_capacity: 1,
    consumer_utilisation: 1,
    consumers: 1,
    durable: true,
    effective_policy_definition: {},
    exclusive: false,
    exclusive_consumer_tag: null,
    garbage_collection: {
      fullsweep_after: 65535,
      max_heap_size: 0,
      min_bin_vheap_size: 46422,
      min_heap_size: 233,
      minor_gcs: 943
    },
    head_message_timestamp: null,
    memory: 143464,
    message_bytes: 0,
    message_bytes_paged_out: 0,
    message_bytes_persistent: 0,
    message_bytes_ram: 0,
    message_bytes_ready: 0,
    message_bytes_unacknowledged: 0,
    message_stats: {
      ack: 2619,
      ack_details: [Object],
      deliver: 2619,
      deliver_details: [Object],
      deliver_get: 2619,
      deliver_get_details: [Object],
      deliver_no_ack: 0,
      deliver_no_ack_details: [Object],
      get: 0,
      get_details: [Object],
      get_empty: 0,
      get_empty_details: [Object],
      get_no_ack: 0,
      get_no_ack_details: [Object],
      publish: 2619,
      publish_details: [Object],
      redeliver: 0,
      redeliver_details: [Object]
    },
    messages: 0,
    messages_details: { rate: 0 },
    messages_paged_out: 0,
    messages_persistent: 0,
    messages_ram: 0,
    messages_ready: 0,
    messages_ready_details: { rate: 0 },
    messages_ready_ram: 0,
    messages_unacknowledged: 0,
    messages_unacknowledged_details: { rate: 0 },
    messages_unacknowledged_ram: 0,
    name: 'amq.gen-UdKWO9rw1Q-kUsc8UjSSOw',
    node: 'rabbit@bfba3f5d8b5f',
    operator_policy: null,
    policy: null,
    recoverable_slaves: null,
    reductions: 1564433,
    reductions_details: { rate: 2149.6 },
    single_active_consumer_tag: null,
    state: 'running',
    type: 'classic',
    vhost: '/'
  }

*/

interface MessageDetail {
    rate: number;
}

export interface Queue {
    arguments: Record<string, any>;
    auto_delete: boolean;
    backing_queue_status?: {
        avg_ack_egress_rate: number;
        avg_ack_ingress_rate: number;
        avg_egress_rate: number;
        avg_ingress_rate: number;
        delta: any[];
        len: number;
        mode: 'default' | string;
        next_seq_id: number;
        q1: number;
        q2: number;
        q3: number;
        q4: number;
        target_ram_count: 'infinity';
    };
    consumer_capacity: number;
    consumer_utilisation: number;
    consumers: number;
    durable: boolean;
    effective_policy_definition: Record<string, any>;
    exclusive: boolean;
    exclusive_consumer_tag: string | null;
    garbage_collection: {
        fullsweep_after: number;
        max_heap_size: number;
        min_bin_vheap_size: number;
        min_heap_size: number;
        minor_gcs: number;
    };
    head_message_timestamp: any | null;
    leader?: string;
    members?: string[];
    memory: number;
    message_bytes: number;
    message_bytes_paged_out: number;
    message_bytes_persistent: number;
    message_bytes_ram: number;
    message_bytes_ready: number;
    message_bytes_unacknowledged: number;
    message_stats: {
        ack: number;
        ack_details: MessageDetail
        deliver: number;
        deliver_details: MessageDetail
        deliver_get: number;
        deliver_get_details: MessageDetail
        deliver_no_ack: number;
        deliver_no_ack_details: MessageDetail;
        get: number;
        get_details: MessageDetail;
        get_empty: number;
        get_empty_details: MessageDetail;
        get_no_ack: number;
        get_no_ack_details: MessageDetail;
        publish: number;
        publish_details: MessageDetail;
        redeliver: number;
        redeliver_details: MessageDetail;
    };
    messages: number;
    messages_details: MessageDetail;
    messages_paged_out: number;
    messages_persistent: number;
    messages_ram: number;
    messages_ready: number;
    messages_ready_details: MessageDetail;
    messages_ready_ram: number;
    messages_unacknowledged: number;
    messages_unacknowledged_details: MessageDetail;
    messages_unacknowledged_ram: number;
    name: string;
    node: string;
    online?: string[];
    open_files?: Record<string, number>;
    operator_policy: any | null;
    policy: any | null;
    recoverable_slaves: any | null;
    reductions: number;
    reductions_details: MessageDetail;
    single_active_consumer_tag: string | null;
    state: 'running' | 'idle' | string;
    type: 'classic' | 'quorum' | string;
    vhost: string;
}
