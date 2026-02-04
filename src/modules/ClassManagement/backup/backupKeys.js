// Single source of truth for ClassManagement storage keys
// This ensures we only export/import relevant data and avoid accidental pollution

export const CLASS_MANAGEMENT_KEYS = [
    // --- Seating Module ---
    'bisinif_class_seating_setup_v1',
    'bisinif_class_seating_rules_v1',
    'bisinif_class_seating_plan_v2',       // Active Plan
    'bisinif_class_seating_history_v1',    // Plan History
    'bisinif_class_analytics_map_v1',      // Manual Map Matches
    'bisinif_class_analytics_selected_exam_v1', // UI Preference

    // --- Class/Roster Module ---
    'bisinif_class_profiles_v1',           // Student Profiles (Behavior, etc)
    'bisinif_class_conflicts_v1',          // Student Conflicts
    'bisinif_class_meta_v1',               // General Meta
    'bisinif_class_roster_v1',             // Main Student List
    'bisinif_class_roster_meta_v1'         // Roster Meta
]

// Groupings for logical operations
export const KEY_GROUPS = {
    ACTIVE_PLAN: [
        'bisinif_class_seating_plan_v2',
        'bisinif_class_seating_setup_v1',
        'bisinif_class_seating_rules_v1',
        'bisinif_class_analytics_map_v1'
    ],
    HISTORY: [
        'bisinif_class_seating_history_v1'
    ],
    ROSTER: [
        'bisinif_class_roster_v1',
        'bisinif_class_profiles_v1',
        'bisinif_class_conflicts_v1',
        'bisinif_class_roster_meta_v1'
    ]
}
