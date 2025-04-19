export const managerDetailsViewConfig = {
    "issue_history": {
        "is_dated": true,
        "is_grouped": false,
    },
    "accepted_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "date"]
    },
    "due_forward": {
        "is_dated": false,
        "is_grouped": false,
    },
    "due_backward": {
        "is_dated": false,
        "is_grouped": true,
        "grouping_keys": ["worker"]
    },
    "submissions": {
        "is_dated": false,
        "is_grouped": true,
        "grouping_keys": ["worker"]
    },
    "total_due": {
        "is_dated": false,
        "is_grouped": false,
    },
    "payment_history": {
        "is_dated": true,
        "is_grouped": false,
    },
    "expense_requests": {
        "is_dated": true,
        "is_grouped": false,
    },
    "forfeited_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "foreiture_date"]
    },
    "on_hold_history": {
        "is_dated": true,
        "is_grouped": true,
        "grouping_keys": ["worker", "hold_date"]
    },

}

export const workerDetailsViewConfig = {
    "due_items": {
        "is_dated": false
    },
    "issue_history": {
        "is_dated": true
    },
    "submit_history": {
        "is_dated": true
    },
    "payment_history": {
        "is_dated": true
    },
    "deductions_from_proprietor": {
        "is_dated": true
    },
    "forfeited_history": {
        "is_dated": true
    },
    "on_hold_history": {
        "is_dated": true
    }
}