const DEV_MODE = process.env.REACT_APP_DEV_MODE === 'true'
const TRANSIENT_DEV_KEYS = ['event_date', 'record_date']

function applyDevMode(config) {
    return Object.fromEntries(
        Object.entries(config)
            .filter(([, v]) => DEV_MODE || !v.dev_only)
            .map(([k, v]) => [k, {
                ...v,
                keys: (!v.is_dated && !DEV_MODE)
                    ? v.keys.filter(key => !TRANSIENT_DEV_KEYS.includes(key))
                    : v.keys
            }])
    )
}

const rawManagerDetailsViewConfig = {
    "issue_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "general_price", "remarks_from_proprietor", "issue_date", "info", "record_date"]
    },
    "accepted_history": {
        "is_dated": true,
        "grouping_keys": ["worker", "accept_date", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "deduction_from_proprietor", "final_remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "info", "record_date"]
    },
    "due_forward": {
        "is_dated": false,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "due_forward_log": {
        "is_dated": false,
        "dev_only": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "due_backward": {
        "is_dated": false,
        "grouping_keys": ["worker"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "due_backward_log": {
        "is_dated": false,
        "dev_only": true,
        "grouping_keys": [],
        "keys": ["worker", "item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "submissions": {
        "is_dated": false,
        "grouping_keys": ["worker", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "total_due": {
        "is_dated": false,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "total_due_log": {
        "is_dated": false,
        "dev_only": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "payment_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["amount", "payment_date", "remarks", "record_date"]
    },
    "expense_requests": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["amount", "request_date", "remarks", "record_date"]
    },
    "forfeited_history": {
        "is_dated": true,
        "grouping_keys": ["worker", "forfeiture_date", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "penalty", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "final_remarks_from_proprietor", "info", "record_date"]
    },
    "on_hold_history": {
        "is_dated": true,
        "grouping_keys": ["worker", "hold_date", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "put_on_hold_by", "holding_remarks", "info", "record_date"]
    },
    "submit_history": {
        "is_dated": true,
        "grouping_keys": ["worker", "submit_date"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "info", "record_date"]
    }
}

const rawWorkerDetailsViewConfig = {
    "custom_prices": {
        "is_dated": false,
        "grouping_keys": [],
        "keys": ["item", "price"]
    },
    "due_items": {
        "is_dated": false,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "event_date", "info", "record_date"]
    },
    "issue_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "issue_date", "info", "record_date"]
    },
    "submit_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "submit_date", "info", "record_date"]
    },
    "payment_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["amount", "payment_date", "remarks", "record_date"]
    },
    "accepted_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["item", "price", "quantity", "deduction_from_proprietor", "final_remarks_from_proprietor", "deduction_from_manager", "accept_date", "remarks_from_manager", "remarks_from_proprietor", "underprocessing_value", "submit_to_proprietor_date", "info", "record_date"]
    },
    "forfeited_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "penalty", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "final_remarks_from_proprietor", "forfeiture_date", "submit_to_proprietor_date", "info", "record_date"]
    },
    "on_hold_history": {
        "is_dated": true,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "hold_date", "holding_remarks", "put_on_hold_by", "submit_to_proprietor_date", "info", "record_date"]
    },
    "held_by_manager": {
        "is_dated": false,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "remarks_from_manager", "event_date", "info", "record_date"]
    }
}

const rawProprietorDetailsViewConfig = {
    "on_hold": {
        "is_dated": false,
        "grouping_keys": [],
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "submit_to_proprietor_date", "hold_date", "put_on_hold_by", "holding_remarks", "worker", "manager", "info"]
    }
}

export const managerDetailsViewConfig = applyDevMode(rawManagerDetailsViewConfig)
export const workerDetailsViewConfig = applyDevMode(rawWorkerDetailsViewConfig)
export const proprietorDetailsViewConfig = applyDevMode(rawProprietorDetailsViewConfig)

export const holdInfoViewConfig = {
    "hold_info": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "hold_date", "submit_to_proprietor_date", "put_on_hold_by", "holding_remarks", "worker", "manager", "info"]
    }
}
