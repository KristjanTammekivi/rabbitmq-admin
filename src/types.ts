import { PartialExcept } from './utility-types';
import { PaginationOptions } from './rabbit-admin';
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

interface MessageStats {
    ack: number;
    ack_details: StatDetail;
    deliver: number;
    deliver_details: StatDetail;
    deliver_get: number;
    deliver_get_details: StatDetail;
    deliver_no_ack: number;
    deliver_no_ack_details: StatDetail;
    get: number;
    get_details: StatDetail;
    get_empty: number;
    get_empty_details: StatDetail;
    get_no_ack: number;
    get_no_ack_details: StatDetail;
    publish: number;
    publish_details: StatDetail;
    redeliver: number;
    redeliver_details: StatDetail;
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
    message_stats: MessageStats;
    messages: number;
    messages_details: StatDetail;
    messages_paged_out: number;
    messages_persistent: number;
    messages_ram: number;
    messages_ready: number;
    messages_ready_details: StatDetail;
    messages_ready_ram: number;
    messages_unacknowledged: number;
    messages_unacknowledged_details: StatDetail;
    messages_unacknowledged_ram: number;
    name: string;
    node: string;
    online?: string[];
    open_files?: Record<string, number>;
    operator_policy: any | null;
    policy: any | null;
    recoverable_slaves: any | null;
    reductions: number;
    reductions_details: StatDetail;
    single_active_consumer_tag: string | null;
    state: 'running' | 'idle' | string;
    type: 'classic' | 'quorum' | string;
    vhost: string;
}

type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers' | 'x-consistent-hash' | 'x-delayed-message' | string;

export interface ExchangeTypeLong {
    name: ExchangeType;
    description: string;
    enabled: boolean;
}

export interface StatDetail {
    rate: number;
}

export interface ChurnRates {
    channel_closed: number;
    channel_closed_details: StatDetail;
    channel_created: number;
    channel_created_details: StatDetail;
    connection_closed: number;
    connection_closed_details: StatDetail;
    connection_created: number;
    connection_created_details: StatDetail;
    queue_created: number;
    queue_created_details: StatDetail;
    queue_declared: number;
    queue_declared_details: StatDetail;
    queue_deleted: number;
    queue_deleted_details: StatDetail;
}

export interface QueueTotals {
    messages: number;
    messages_details: StatDetail;
    messages_ready: number;
    messages_ready_details: StatDetail;
    messages_unacknowledged: number;
    messages_unacknowledged_details: StatDetail;
}

export interface AmqpListener {
    node: string;
    protocol: 'amqp';
    ip_address: string;
    port: number;
    socket_opts: {
        backlog: number;
        nodelay: boolean;
        linger: any[];
        exit_on_close: boolean;
    };
}

export interface ClusteringListener {
    node: string;
    protocol: 'clustering';
    ip_address: string;
    port: number;
    socket_opts: any[];
}

export interface HttpListener {
    node: string;
    protocol: 'http';
    ip_address: string;
    port: number;
    socket_opts: {
        cowboy_opts: {
            sendfile: boolean;
        };
        port: number;
    }
}

export interface HttpPrometheusListener {
    node: string;
    protocol: 'http/prometheus';
    ip_address: string;
    port: number;
    socket_opts: {
        cowboy_opts: {
            sendfile: boolean;
        };
        port: number;
        protocol: 'http/prometheus';
    }
}

export type Listener = AmqpListener | ClusteringListener | HttpListener | HttpPrometheusListener;

export interface Context {
    ssl_opts: any[];
    node: string;
    description: string;
    path: string;
    cowboy_opts: string;
    port: string;
    protocol?: string;
}

export interface Overview {
    management_version: string;
    rates_mode: 'basic' | string;
    sample_retention_policies: {
        global: string[];
        basic: string[];
        detailed: string[];
    };
    exchange_types: ExchangeTypeLong[];
    product_version: string;
    product_name: 'RabbitMQ';
    rabbitmq_version: string;
    cluster_name: string;
    erlang_version: string;
    erlang_full_version: string;
    disable_stats: boolean;
    enable_queue_totals: boolean;
    message_stats: MessageStats;
    churn_rates: ChurnRates;
    queue_totals: QueueTotals;
    object_totals: {
        channels: number;
        connections: number;
        consumers: number;
        exchanges: number;
        queues: number;
    };
    statistics_db_event_queue: number;
    node: string;
    listeners: Listener[];
    contexts: Context[];
}

export interface ClusterName {
    name: string;
}

interface AuthMechanism {
    name: 'PLAIN' | 'RABBIT-CR-DEMO' | 'AMQPLAIN' | string;
    description: string;
    enabled: boolean;
}

interface Application {
    name: string;
    description: string;
    version: string;
}

export interface Node {
    partitions: any[];
    os_pid: string;
    fd_total: number;
    sockets_total: number;
    mem_limit: number;
    mem_alarm: boolean;
    disk_free_limit: number;
    disk_free_alarm: boolean;
    proc_total: number;
    rates_mode: 'basic' | string;
    uptime: number;
    run_queue: number;
    processors: number;
    exchange_types: ExchangeType[];
    auth_mechanisms: AuthMechanism[];
    applications: Application[];
    contexts: Context[];
    log_files: string[];
    db_dir: string;
    config_files: string[];
    net_ticktime: number;
    enabled_plugins: string[];
    mem_calculation_strategy: 'rss' | string;
    ra_open_file_metrics: {
        ra_log_wal: number;
        ra_log_segment_writer: number;
    };
    name: string;
    type: 'disc' | string;
    running: boolean;
    mem_used: number;
    mem_used_details: StatDetail;
    fd_used: number;
    fd_used_details: StatDetail;
    sockets_used: number;
    sockets_used_details: StatDetail;
    proc_used: number;
    proc_used_details: StatDetail;
    disk_free: number;
    disk_free_details: StatDetail;
    gc_num: number;
    gc_num_details: StatDetail;
    gc_bytes_reclaimed: number;
    gc_bytes_reclaimed_details: StatDetail;
    context_switches: number;
    context_switches_details: StatDetail;
    io_read_count: number;
    io_read_count_details: StatDetail;
    io_read_bytes: number;
    io_read_bytes_details: StatDetail;
    io_read_avg_time: number;
    io_read_avg_time_details: StatDetail;
    io_write_count: number;
    io_write_count_details: StatDetail;
    io_write_bytes: number;
    io_write_bytes_details: StatDetail;
    io_write_avg_time: number;
    io_write_avg_time_details: StatDetail;
    io_sync_count: number;
    io_sync_count_details: StatDetail;
    io_sync_avg_time: number;
    io_sync_avg_time_details: StatDetail;
    io_seek_count: number;
    io_seek_count_details: StatDetail;
    io_seek_avg_time: number;
    io_seek_avg_time_details: StatDetail;
    io_reopen_count: number;
    io_reopen_count_details: StatDetail;
    mnesia_ram_tx_count: number;
    mnesia_ram_tx_count_details: StatDetail;
    mnesia_disk_tx_count: number;
    mnesia_disk_tx_count_details: StatDetail;
    msg_store_read_count: number;
    msg_store_read_count_details: StatDetail;
    msg_store_write_count: number;
    msg_store_write_count_details: StatDetail;
    queue_index_journal_write_count: number;
    queue_index_journal_write_count_details: StatDetail;
    queue_index_write_count: number;
    queue_index_write_count_details: StatDetail;
    queue_index_read_count: number;
    queue_index_read_count_details: StatDetail;
    io_file_handle_open_attempt_count: number;
    io_file_handle_open_attempt_count_details: StatDetail;
    io_file_handle_open_attempt_avg_time: number;
    io_file_handle_open_attempt_avg_time_details: StatDetail;
    connection_created: number;
    connection_created_details: StatDetail;
    connection_closed: number;
    connection_closed_details: StatDetail;
    channel_created: number;
    channel_created_details: StatDetail;
    channel_closed: number;
    channel_closed_details: StatDetail;
    queue_declared: number;
    queue_declared_details: StatDetail;
    queue_created: number;
    queue_created_details: StatDetail;
    queue_deleted: number;
    queue_deleted_details: StatDetail;
    cluster_links: any[];
    metrics_gc_queue_length: {
        connection_closed: number;
        channel_closed: number;
        consumer_deleted: number;
        exchange_deleted: number;
        queue_deleted: number;
        vhost_deleted: number;
        node_node_deleted: number;
        channel_consumer_deleted: number;
    };
}

export type ManagementPlugin = Record<string, any>;

export interface Definitions {
    rabbit_version: string;
    rabbitmq_version: string;
    product_name: string;
    product_version: string;
    users: {
        name: string;
        password_hash: string;
        hashing_algorithm: string;
        tags: string[];
        limits: Record<string, any>;
    }[];
    vhosts: {
        name: string;
    }[];
    permissions: Permissions[];
    topic_permissions: any[]; // Permissions[]?
    parameters: any[]; // Same as global parameters?
    global_parameters: {
        name: string;
        value: string;
    }[];
    policies: any[];
    queues: {
        name: string;
        vhost: string;
        durable: boolean;
        auto_delete: boolean;
        internal : boolean;
        arguments: Record<string, any>;
    }[];
    bindings: {
        source: string;
        vhost: string;
        destination: string;
        destination_type: 'queue' | 'exchange' | string;
        routing_key: string;
        arguments: Record<string, any>;
    }[];
}

export interface Connection {
    auth_mechanism: 'PLAIN' | string;
    channel_max: number;
    channels: number;
    client_properties: {
        capabilities: {
            authentication_failure_close: boolean;
            'basic.nack': boolean;
            'connection.blocked': boolean;
            consumer_cancel_notify: boolean;
            exchange_exchange_bindings: boolean;
            publisher_confirms: boolean;
        };
        information: string;
        platform: string;
        product: string;
        version: string;
    };
    connected_at: number;
    frame_max: number;
    garbage_collection: {
        fullsweep_after: number;
        max_heap_size: number;
        min_bin_vheap_size: number;
        min_heap_size: number;
        minor_gcs: number;
    };
    host: string;
    name: string;
    node: string;
    peer_cert_issuer: any | null;
    peer_cert_subject: any | null;
    peer_cert_validity: any | null;
    peer_host: string;
    peer_port: number;
    port: number;
    protocol: string;
    recv_cnt: number;
    recv_oct: number;
    recv_oct_details: StatDetail;
    reductions: number;
    reductions_details: StatDetail;
    send_cnt: number;
    send_oct: number;
    send_oct_details: StatDetail;
    send_pend: number;
    ssl: boolean;
    ssl_cipher: any | null;
    ssl_hash: any | null;
    ssl_key_exchange: any | null;
    ssl_protocol: any | null;
    state: 'running' | string;
    timeout: number;
    type: 'network' | string;
    user: string;
    user_who_performed_action: string;
    vhost: string;
}

export interface Channel {
    acks_uncommitted: number;
    confirm: boolean;
    connection_details: {
        name: string;
        peer_host: string;
        peer_port: number;
    };
    consumer_count: 1;
    garbage_collection: {
        fullsweep_after: number;
        max_heap_size: number;
        min_bin_vheap_size: number;
        min_heap_size: number;
        minor_gcs: number;
    };
    global_prefetch_count: number;
    message_stats: {
        ack: number;
        ack_details: StatDetail;
        deliver: number;
        deliver_details: StatDetail;
        deliver_get: number;
        deliver_get_details: StatDetail;
        deliver_no_ack: number;
        deliver_no_ack_details: StatDetail;
        get: number;
        get_details: StatDetail;
        get_empty: number;
        get_empty_details: StatDetail;
        get_no_ack: number;
        get_no_ack_details: StatDetail;
        redeliver: number;
        redeliver_details: StatDetail;
    };
    messages_unacknowledged: number;
    messages_uncommitted: number;
    messages_unconfirmed: number;
    name: string;
    node: string;
    number: number;
    pending_raft_commands: number;
    prefetch_count: number;
    reductions: number;
    reductions_details: StatDetail;
    state: 'running' | string;
    transactional: boolean;
    user: string;
    user_who_performed_action: string;
    vhost: string;
}

export interface Exchange {
    arguments: Record<string, any>;
    auto_delete: boolean;
    durable: boolean;
    internal: boolean;
    message_stats?: {
        publish_in: number;
        publish_in_details: StatDetail;
        publish_out: number;
        publish_out_details: StatDetail;
    };
    name: string;
    type: ExchangeType;
    user_who_performed_action: string;
    vhost: string;
}

export interface PagedResponse<T> {
    filtered_count: number;
    item_count: number;
    items: T[];
    page: number;
    page_count: number;
    page_size: number;
    total_count: number;
    outgoing?: any[];
}

export interface Binding {
    source: string;
    vhost: string;
    destination: string;
    destination_type: 'queue' | 'exchange' | string;
    routing_key: string;
    arguments: Record<string, any>;
    properties_key: string;
}

export interface PublishMessage {
    properties: Record<string, any>;
    routing_key: string;
    payload: string;
    payload_encoding: 'string' | string;
}

export interface PublishMessageResponse {
    routed: boolean;
}

export interface CreateQueue {
    auto_delete?: boolean;
    durable?: boolean;
    arguments?: Record<string, any>;
    node?: string;
}

export interface DeleteQueue {
    ifUnused?: boolean;
    ifEmpty?: boolean;
}

export interface RabbitmqInterface {
    getOverview: () => Promise<Overview>;
    getClusterName: () => Promise<ClusterName>;
    setClusterName: (name: string) => Promise<ClusterName>;
    getNodes: () => Promise<Node[]>;
    getNode: (name: string) => Promise<Node>;
    getExtensions: () => Promise<ManagementPlugin>;
    getDefinitions: (vhost?: string) => Promise<Definitions>;
    getConnections: (paginationOptions?: PaginationOptions) => Promise<Connection[]>;
    getConnection: (name: string) => Promise<Connection | null>;
    closeConnection: (name: string, reason: string) => Promise<void>;
    getVhostConnections: (vhost: string, paginationOptions?: PaginationOptions) => Promise<Connection[]>;
    getChannels: (paginationOptions?: PaginationOptions) => Promise<Channel[]>;
    getChannel: (channelId: string) => Promise<Channel>;
    getConsumers: (vhost?: string) => Promise<Consumer[]>;
    getExchanges: (vhost?: string | null, paginationOptions?: PaginationOptions) => Promise<PagedResponse<Exchange>>;
    getExchange: (vhost: string, name: string) => Promise<Exchange>;
    createExchange: (vhost: string, exchange: PartialExcept<Exchange, 'type'>) => Promise<Exchange>;
    deleteExchange: (vhost: string, name: string) => Promise<void>;
    getSourceExchangeBindings: (vhost: string, exchange: string) => Promise<Binding[]>;
    getDestinationExchangeBindings: (vhost: string, exchange: string) => Promise<Binding[]>;
    publishToExchange: (
        vhost: string,
        exchange: string,
        message: PublishMessage,
    ) => Promise<PublishMessageResponse>;
    getQueues: (vhost?: string | null, paginationOptions?: PaginationOptions) => Promise<PagedResponse<Queue>>;
    getQueue: (vhost: string, name: string) => Promise<Queue[]>;
    createQueue: (vhost: string, name: string, queue: CreateQueue) => Promise<Queue>;
    deleteQueue: (vhost: string, name: string, options: DeleteQueue) => Promise<void>;
    getQueueBindings: (vhost: string, queue: string) => Promise<Binding[]>;
    getConnectionChannels: (name: string) => Promise<Channel[]>;
    getVhostChannels: (vhost: string) => Promise<Channel[]>;
    listVhosts: () => Promise<Vhost[]>;
    getVhost: (name: string) => Promise<Vhost | null>;
    deleteVhost: (name: string) => Promise<unknown>;
    createVhost: (name: string) => Promise<void>;
    setUserPermissions: (vhost: string, username: string, permissions: PermissionsObject) => Promise<unknown>;
    getUserPermissions: (vhost: string, username: string) => Promise<Permissions>;
    createBinding: (params: CreateBindingParams) => Promise<''>;
    getBinding: (params: GetBindingParams) => Promise<Binding>;
    getBindings: (params: GetBindingsParams) => Promise<Binding[]>;
    deleteBinding: (params: GetBindingParams) => Promise<''>;
}

export interface GetBindingsParamsBase {
    vhost: string;
}

export interface GetBindingsForSourceAndDestination extends GetBindingsParamsBase {
    source: string;
    destination: string;
    type: 'queue' | 'exchange';
}

export type GetBindingsParams = Partial<GetBindingsParamsBase> | GetBindingsForSourceAndDestination;

export type GetBindingParams = GetBindingsForSourceAndDestination & { props: string };

export type CreateBindingParams = GetBindingsForSourceAndDestination & {
    routingKey: Record<string, any>;
    args: Record<string, any>;
};
