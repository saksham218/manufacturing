export const managerDetailsViewConfig = {
    "issue_history": {
        "is_dated": true,
        "is_grouped": false,
        "keys": ["item", "quantity", "underprocessing_value", "general_price", "remarks_from_proprietor", "date", "price", "info"]
    },
    "accepted_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "date", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "deduction_from_proprietor", "final_remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "info"]
    },
    "due_forward": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "info"]
    },
    "due_backward": {
        "is_dated": false,
        "is_grouped": true,
        "grouping_keys": ["worker", "submit_from_worker_date"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "info"]
    },
    "submissions": {
        "is_dated": false,
        "is_grouped": true,
        "grouping_keys": ["worker", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "info"]
    },
    "total_due": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "info"]
    },
    "payment_history": {
        "is_dated": true,
        "is_grouped": false,
        "keys": ["amount", "date", "remarks"]
    },
    "expense_requests": {
        "is_dated": true,
        "is_grouped": false,
        "keys": ["amount", "date", "remarks"]
    },
    "forfeited_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "forfeiture_date", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "penalty", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "final_remarks_from_proprietor", "info"]
    },
    "on_hold_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "hold_date", "submit_to_proprietor_date"],
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "put_on_hold_by", "holding_remarks", "info"]
    },

}

export const workerDetailsViewConfig = {
    "due_items": {
        "is_dated": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "info"]
    },
    "issue_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "date", "info"]
    },
    "submit_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "date", "info"]
    },
    "payment_history": {
        "is_dated": true,
        "keys": ["amount", "date", "remarks"]
    },
    "deductions_from_proprietor": {
        "is_dated": true,
        "keys": ["item", "price", "quantity", "deduction_from_proprietor", "final_remarks_from_proprietor", "deduction_from_manager", "deduction_date", "remarks_from_manager", "remarks_from_proprietor", "underprocessing_value", "info"]
    },
    "forfeited_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "penalty", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "final_remarks_from_proprietor", "forfeiture_date", "info"]
    },
    "on_hold_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "hold_date", "holding_remarks", "put_on_hold_by", "info"]
    },
    "held_by_manager": {
        "is_dated": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "remarks_from_manager", "info"]
    },
}

export const holdInfoViewConfig = {
    "hold_info": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "hold_date", "submit_to_proprietor_date", "put_on_hold_by", "holding_remarks", "worker", "manager", "info"]
    }
}