export const managerDetailsViewConfig = {
    "issue_history": {
        "is_dated": true,
        "is_grouped": false,
        "keys": ["item", "quantity", "underprocessing_value", "general_price", "remarks_from_proprietor", "date", "price", "hold_info"]
    },
    "accepted_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "date"],
        "keys": ["item", "quantity", "price", "deduction_from_proprietor", "final_remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "hold_info"]
    },
    "due_forward": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "hold_info"]
    },
    "due_backward": {
        "is_dated": false,
        "is_grouped": true,
        "grouping_keys": ["worker"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "hold_info"]
    },
    "submissions": {
        "is_dated": false,
        "is_grouped": true,
        "grouping_keys": ["worker"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "hold_info"]
    },
    "total_due": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "hold_info"]
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
        "grouping_keys": ["worker", "forfeiture_date"],
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "final_remarks_from_proprietor", "hold_info"]
    },
    "on_hold_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "hold_date"],
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "put_on_hold_by", "holding_remarks", "hold_info"]
    },

}

export const workerDetailsViewConfig = {
    "due_items": {
        "is_dated": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "hold_info"]
    },
    "issue_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "date", "hold_info"]
    },
    "submit_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "date", "hold_info"]
    },
    "payment_history": {
        "is_dated": true,
        "keys": ["amount", "date", "remarks"]
    },
    "deductions_from_proprietor": {
        "is_dated": true,
        "keys": ["item", "price", "quantity", "deduction_from_proprietor", "final_remarks_from_proprietor", "deduction_from_manager", "deduction_date", "remarks_from_manager", "remarks_from_proprietor", "underprocessing_value", "hold_info"]
    },
    "forfeited_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "final_remarks_from_proprietor", "forfeiture_date", "hold_info"]
    },
    "on_hold_history": {
        "is_dated": true,
        "keys": ["item", "quantity", "price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "hold_date", "holding_remarks", "put_on_hold_by", "hold_info"]
    },
    "held_by_manager": {
        "is_dated": false,
        "keys": ["item", "quantity", "price", "underprocessing_value", "remarks_from_proprietor", "remarks_from_manager", "hold_info"]
    },
}

export const holdInfoViewConfig = {
    "hold_info": {
        "is_dated": false,
        "is_grouped": false,
        "keys": ["price", "partial_payment", "underprocessing_value", "remarks_from_proprietor", "deduction_from_manager", "remarks_from_manager", "hold_date", "put_on_hold_by", "holding_remarks", "worker", "manager"]
    }
}