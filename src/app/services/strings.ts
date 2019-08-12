export var globalStrings =
{
  place_holder: "placeholder",
  multi_line_string: `
      1. If you want to determind
      2. Where your line will break
      3. and new line would appear
      4. Use this special quotes
      5. to write you multi-line string
  `,
  add_feature_subheader: "",
  add_feature_namespace_title: "",
  add_feature_namespace: "A prefix for the feature name that allows you to group related features together.",
  add_feature_name_title: "",
  add_feature_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_feature_group_title: "",
  add_feature_group: "The feature will be visible to the internal user groups specified here.",
  add_feature_description_title: "",
  add_feature_description: "",
  add_feature_enabled_title: "",
  add_feature_enabled: "",

  add_feature_to_group_modal_title: `In a mutual exclusion group, up to N {0}s in the group can be "on" in the app at the same time.
  The {1} {0} will be mutually exclusive with the {0} or group that you select below.
  `,

  add_feature_configuration_to_group_modal_title: `In a mutual exclusion group, up to N {0}s in the group can be applied at the same time.
  The {1} {0} will be mutually exclusive with the {0} or group that you select below.
  `,

  add_feature_to_group_subheader: "This feature cannot be \"on\" at the same time as the features in the selected group.",
  add_feature_to_mx_group_subheader: "In a mutual exclusion group, up to N features that meet their criteria can be \"on\", where N is the maximal number of features that can be \"on\" at the same time. Features should be listed in descending order of preference.",

  add_product_subheader: "",
    add_user_subheader: "",
    add_user_isgroup_title: "",
    add_user_isgroup: "",
  add_product_name_title: "",
  add_product_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_product_description_title: "",
  add_product_description: "",

    add_user_id_title: "",
    add_user_id: "",
  add_branch_subheader: "",
  add_branch_base_title: "",
  add_branch_base: `
New and checked out features in the selected branch will be added or checked out in the new branch.
`,
  add_branch_name_title: "",
  add_branch_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_branch_description_title: "",
  add_branch_description: "",

    add_experiment_name: `
Enter a short experiment name for optimal display in the dashboard.
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_experiment_name_title: "",
  add_entitlement_name: `
Enter a short entitlement name for optimal display in the dashboard.
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
    add_purchase_option_name: `
Enter a short purchase option name for optimal display in the dashboard.
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
    add_experiment_displayname_title: "",
    add_experiment_displayname: "Optional name for display in Airlock Control Center. If no Display Name is specified, the Short Name is displayed.",
  add_experiment_description_title: "",
  add_experiment_group: "The experiment will be visible to the internal user groups specified here.",
  add_purchase_option_group: "The purchase option will be visible to the internal user groups specified here.",
  add_entitlement_group: "The entitlement will be visible to the internal user groups specified here.",
  add_experiment_group_title: "",
  add_experiment_description: "",
  edit_experiment_min_app_version_title: "",
  edit_experiment_min_app_version: "The minimum version of an app on which the experiment can be run.",
  edit_experiment_max_app_version_title: "",
  edit_experiment_max_app_version: "The experiment ranges from the minimum version up to, but not including, the maximum version.",
    edit_experiment_last_indexed_title: "",
    edit_experiment_last_indexed: "",

  add_variant_name_title: "",
  add_variant_name:  `
Enter a short variant name for optimal display in the dashboard.
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
    add_variant_displayname_title: "",
    add_variant_displayname:"Optional name for display in the Dashboard Overview and in Airlock Control Center. If no Display Name is specified, the Short Name is displayed.",
  add_variant_description_title: "",
  add_variant_group: "The variant will be visible to the internal user groups specified here.",
  add_variant_group_title: "",
  add_variant_description: "",
  edit_variant_min_app_version_title: "",
  edit_variant_min_app_version: "The minimum version of the app for which this experiment is tested and should be enabled.",
  add_variant_branch_base_title: "",
  add_variant_branch_base: `
Only branches in the experiment's version range are available for selection.
`,



  document_links_subheader: "Click the document links to download the files.",

  edit_feature_title: "Edit Feature",
  edit_purchase_title: "Edit Entitlement",
    edit_entitlement_namespace: "A prefix for the entitlement name that allows you to group related entitlements together.",
    edit_purchase_option_title: "Edit Purchase Option",
  edit_purchase_option_store_type_title:"",
  edit_purchase_option_store_type:"The type of store used for this entitlement (Google Play Store, Apple App Store, etc.)",
  edit_purchase_option_product_id_title:"",
  edit_purchase_option_product_id:"The product ID, as appeared in the store",
  edit_feature_subheader: "",
  edit_feature_namespace_title: "",
  edit_purchase_option_namespace: "A prefix for the purchase option name that allows you to group related purchase options together.",
  edit_feature_namespace: "A prefix for the feature name that allows you to group related features together.",
  edit_ordering_rule_namespace: "A prefix for the ordering rule name that allows you to group related ordering rules together.",
  edit_configuration_namespace: "A prefix for the configuration name that allows you to group related configurations together.",
  edit_feature_stage_title: "",
  edit_feature_stage: "Either DEVELOPMENT or PRODUCTION",
  edit_feature_rollout_title: "",
  edit_entitlement_rollout: "The percentage of users who will see this entitlement. You can enter a value with up to 4 decimal places.",
  edit_purchase_option_rollout: "The percentage of users who will see this purchase option. You can enter a value with up to 4 decimal places.",
  edit_feature_rollout: "The percentage of users who will see this feature. You can enter a value with up to 4 decimal places.",
  edit_configuration_rollout: "The percentage of users who will see this configuration. You can enter a value with up to 4 decimal places.",
  edit_ordering_rule_rollout: "The percentage of users who will see this ordering rule. You can enter a value with up to 4 decimal places.",
  edit_feature_min_app_version_title: "",
  edit_entitlement_min_app_version: "The minimum version of the app for which this entitlement is tested and should be enabled.",
  edit_purchase_option_min_app_version: "The minimum version of the app for which this purchase option is tested and should be enabled.",
  edit_feature_min_app_version: "The minimum version of the app for which this feature is tested and should be enabled.",
  edit_configuration_min_app_version: "The minimum version of the app for which this configuration is tested and should be enabled.",
  edit_ordering_rule_min_app_version: "The minimum version of the app for which this ordering rule is tested and should be enabled.",
  edit_feature_enabled_title: "",
  edit_feature_enabled: "",
  edit_feature_default_title: "",
  edit_purchase_option_default: `
When the app is run for the first time and the server is not available, 
this setting determines whether the purchase option is on or off.
`,
    edit_feature_default: `
When the app is run for the first time and the server is not available, 
this setting determines whether the feature is on or off.
`,
    edit_entitlement_default: `
When the app is run for the first time and the server is not available, 
this setting determines whether the entitlement is on or off.
`,
  edit_feature_premium_title: "",
  edit_feature_premium: `
Turn this switch on to define this feature as premium feature
`,
    edit_feature_assosiate_with_purchase: `
The feature can be ON only if this entitlement has been purchased
`,
  edit_configuration_default: `
When the app is run for the first time and the server is not available, 
this setting determines whether the configuration is applied or not.
`,
  edit_feature_owner_title: "",
  edit_feature_owner: "",
  edit_feature_creator_title: "",
  edit_feature_creator: "",
  edit_feature_name_title: "",
  edit_feature_display_name_title: "",
  edit_feature_name: "",
  edit_feature_display_name: "Optional name for the feature displayed in Airlock Control Center. If no Display Name is specified, the feature name is displayed.",
  edit_purchase_option_display_name: "Optional name for the purchase option displayed in Airlock Control Center. If no Display Name is specified, the purchase option name is displayed.",
  edit_entitlement_display_name: "Optional name for the entitlement displayed in Airlock Control Center. If no Display Name is specified, the entitlement name is displayed.",
  add_feature_display_name_title: "Optional name for the feature displayed in Airlock Control Center. If no Display Name is specified, the feature name is displayed.",
  edit_feature_groups_title: "",
  edit_entitlement_groups: "The entitlement will be visible to the internal user groups specified here.",
  edit_purchase_option_groups: "The purchase option will be visible to the internal user groups specified here.",
  edit_feature_groups: "The feature will be visible to the internal user groups specified here.",
  edit_feature_groups_alert: "The group assigned to this feature does not exist for one of the parent features. This will make this feature not visible.",
  edit_configuration_groups: "The configuration will be visible to the internal user groups specified here.",
  edit_ordering_rules_groups: "The ordering rule will be visible to the internal user groups specified here.",
  edit_feature_description_title: "",
  edit_feature_description: "",
  edit_feature_empty_ordering_rule_value_error: "Enter a decimal number or JavaScript expression to specify the weight of each subfeature.",
  edit_feature_creation_date_title: "",
  edit_feature_creation_date: "",
  edit_feature_last_modified_title: "",
  edit_feature_last_modified: "",
  edit_feature_error_min_feature_less_min_version: "The feature's minimum version is less than the minimum version in the product version range.",
  edit_feature_error_min_feature_bigger_max_version: "The feature's minimum version is greater or equal than the maximum version in the product version range.",
  edit_feature_config_schema: "",
  edit_feature_config_schema_title: "",
  edit_feature_default_config: "",
  edit_feature_default_config_title: "",
  edit_feature_output_config: "",
  edit_feature_output_config_title: "",
  edit_feature_rule_tab_heading: "Rule",
  edit_feature_rule_label: "Rule",
  edit_feature_premium_tab_heading: "Premium",
  edit_feature_premium_label: "Rule",
  edit_feature_rule_autocomplete: "For Airlock Rule autocomplete press: Mac: 'Alt-Space' Win: 'Ctrl-Space'",
  edit_feature_configuration_tab_details: `The Configuration Schema defines the types of data that determine the behavior of the feature.
   The Default Configuration values are used when no configuration rules specify other values.
   `,
  edit_feature_configuration_tab_heading: "Configuration",
  edit_feature_ordering_rule_tab_heading: "Ordering Rule",
  edit_feature_rule_tab_learn_more: "Learn more...",
  edit_feature_configuration_configuration_edit_title: "Configuration Schema",
  edit_feature_configuration_default_configuration_edit_title: "Default Configuration",

  edit_configuration_title: "Edit Configuration Values",
  edit_ordering_rule_title: "Edit Ordering Rule",
  edit_configuration_rule_tab_learn_more: "Values",
  edit_configuration_configuration_tab_details: `The Configuration is a set of parameters that can override the default values.`,
  edit_feature_configuration_tab_details_1: `The Configuration Schema is a `,
  edit_feature_configuration_tab_details_link: `JSON schema`,
  edit_feature_configuration_tab_details_2: ` that defines the types of data that determine the behavior of the feature.
   The Default Configuration values are used when no configuration rules specify other values.`,
    edit_entitlement_configuration_tab_details_2: ` that defines the types of data that determine the behavior of the entitlement.
   The Default Configuration values are used when no configuration rules specify other values.`,
    edit_purchase_option_configuration_tab_details_2: ` that defines the types of data that determine the behavior of the purchase option.
   The Default Configuration values are used when no configuration rules specify other values.`,

  edit_order_rule_title: "Edit Configuration Values",
  edit_order_rule_tab_learn_more: "Weights",
  edit_order_rule_tab_details: `Set the weight of each subfeature by entering a decimal number or JavaScript expression.`,
  edit_order_rule_tab_combo_desc: `Select subfeature: `,
  edit_feature_order_rule_tab_details_1: `The Configuration Schema is a `,
  edit_feature_order_rule_tab_details_link: `JSON schema`,
  edit_feature_order_rule_tab_details_2: ` that defines the types of data that determine the behavior of the feature.
   The Default Configuration values are used when no configuration rules specify other values.`,

  edit_stream_filter_edit_title: "Filter",
  edit_stream_processor_edit_title: "Processor",
  edit_stream_schema_edit_title: "Result schema",
  edit_notification_schema_edit_title: "Notification schema",
  edit_stream_scheduler_type: `Real-Time: Events are sent for processing immediately.
   Regular: Events are sent for processing periodically, for example, every time the app is moved to the background or closed.
   `,
  edit_feature_rule_tab_context_schema: "Schema",
  edit_feature_fallback_switch_text: "In case of error:",
  edit_feature_fallback_switch_label: "Cache Results ",
  edit_feature_cache: "When Cache Results is on, the last known value (enabled or disabled) is used when a rule error occurs.",
  add_feature_hirarchy_details: `
The hierarchy shows the location of the feature in relation to other features in the selected product and version range. If the parent or ancestor of a feature is disabled, all subfeatures will be off.
The parent feature is highlighted in the hierarchy. You can change the location of a feature by selecting a different parent.
`,
  add_entitlement_hirarchy_details: `
The hierarchy shows the location of the entitlement in relation to other entitlements in the selected product and version range. If the parent or ancestor of a entitlement is disabled, all subentitlements will be off.
The parent entitlement is highlighted in the hierarchy. You can change the location of a entitlement by selecting a different parent.
`,
    add_purchase_option_hirarchy_details: `
The hierarchy shows the location of the purchase option in relation to entitlements in the selected product and version range. If the parent or ancestor of a purchase option is disabled, all subpurchase options will be off.
The parent entitlement is highlighted in the hierarchy. You can change the location of a purchase option by selecting a different parent.
`,
  edit_experiment_title: "Edit Experiment",
  edit_experiment_stage: "Either DEVELOPMENT or PRODUCTION",
  edit_experiment_stage_title: "",
  edit_experiment_name: `
Enter a short experiment name for optimal display in the dashboard.
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  edit_experiment_name_title: "",
  edit_experiment_displayname:"Optional name for display in Airlock Control Center. If no Display Name is specified, the Short Name is displayed.",
  edit_experiment_displayname_title:"",
  edit_experiment_rollout: "The percentage of users who will see this experiment. You can enter a value with up to 4 decimal places.",
  edit_experiment_rollout_title: "",
  edit_experiment_enabled_title: "",
  edit_experiment_enabled: "",
    edit_experiment_index_title: "",
    edit_experiment_index: "Turn on indexing to gather analytics data for display in the dashboard. Turn off to pause indexing.",
  edit_experiment_groups_title: "",
  edit_experiment_groups: "The experiment will be visible to the internal user groups specified here.",
  edit_experiment_description_title: "",
  edit_experiment_description: "",
  edit_experiment_creator_title: "",
  edit_experiment_creator: "",
  edit_experiment_creation_date_title: "",
  edit_experiment_creation_date: "",
  edit_experiment_last_modified_title: "",
  edit_experiment_last_modified: "",
  edit_experiment_rule_tab_heading: "Rule",
  edit_experiment_rule_tab_details: "Enter rules in JavaScript based on contextual data like weather, location, and the user’s profile.",
  edit_experiment_rule_tab_learn_more: "Learn more...",
  edit_experiment_description_tab_heading: "Description",
  edit_experiment_error_min_experiment_bigger_max_version: "The experiment's minimum version is greater or equal than the maximum version in the product version range.",
  edit_change_production_experiment:"Are you sure you want to change this experiment in production?",
  edit_experiment_analytics_tab_heading: "Analytics",
  edit_experiment_analytics_summary_features_field_tooltip: "",
  edit_experiment_analytics_summary_features_field_tooltip_title: "",
  edit_experiment_analytics_summary_context_field_tooltip: "",
  edit_experiment_analytics_summary_context_field_tooltip_title: "",
  edit_experiment_analytics_no_context_selected: "No context fields selected for analytics",
  edit_experiment_analytics_no_items_selected: "No items selected for analytics",
  edit_experiment_analytics_appeared_in: "Reported in branches:",
  edit_experiment_analytics_appeared_in_all: "Reported in all branches",

  edit_variant_name: "",
  edit_variant_name_title: "",
  edit_variant_displayname: "Optional name for the variant displayed in the Dashboard Overview and Airlock Control Center. If no Display Name is specified, the variant name is displayed.",
  edit_variant_displayname_title: "",
  edit_variant_title: "Edit Variant",
  edit_variant_stage: "Either DEVELOPMENT or PRODUCTION",
  edit_variant_creator_title: "",
  edit_variant_creator: "",
  edit_variant_rollout: "The percentage of users who will see this variant. You can enter a value with up to 4 decimal places.",
  edit_varinant_rollout_title: "",
  edit_variant_groups_title: "",
  edit_variant_groups: "The variant will be visible to the internal user groups specified here.",
  edit_variant_creation_date_title: "",
  edit_variant_creation_date: "",
  edit_variant_last_modified_title: "",
  edit_variant_last_modified: "",
  edit_variant_enabled_title: "",
  edit_variant_enabled: "",
  edit_variant_rule_tab_heading: "Rule",
  edit_variant_rule_tab_details: "Enter rules in JavaScript based on contextual data like weather, location, and the user’s profile.",
  edit_variant_rule_tab_learn_more: "Learn more...",
  edit_variant_description_tab_heading: "Description",
  edit_variant_description_title: "",
  edit_variant_description: "",
  edit_change_production_variant:"Are you sure you want to change this variant in production?",
  variant_cell_control_label_text:"This variant is marked as the experiment's control group",
  add_feature_analytic_tab_details: "Mark the feature configuration attributes to send to Analytic",
  add_feature_rule_tab_details: "Enter a rule in JavaScript based on contextual data like weather, location, and the user’s profile.",
  add_feature__premium_rule_tab_details: "Enter a rule in JavaScript based on contextual data. When this rule will be evaluated to false the feature will not be dependent on a purchase.",

  reorder_features_subheader: `
Arrange features in descending order of preference.
Up to the first N features that meet their criteria can be \"on\". N is the maximal number of features that can be \"on\" at the same time.
`,
    reorder_items_subheader: `
Arrange {0}s in descending order of preference.
Up to the first N {0}s that meet their criteria can be \"on\". N is the maximal number of {0}s that can be \"on\" at the same time.
`,
  reorder_experiments_subheader: `
Arrange experiments in descending order of preference.
`,

  reorder_notifications_subheader: `
Arrange notifications in descending order of priority.
`,

  reorder_variants_subheader: `
Arrange variants in descending order of preference.
`,
  reorder_configuration_subheader: `
Arrange configurations in descending order of preference.
Up to the first N configurations that meet their criteria will be applied. N is the maximal number of configurations 
that can be applied at the same time.
`,
  reorder_ordering_rule_subheader: `
Arrange Ordering rules in descending order of preference.
Up to the first N Ordering rules that meet their criteria will be applied. N is the maximal number of ordering rules 
that can be applied at the same time.
`,

  reorder_configuration_root_subheader: `
Arrange configurations in descending order of preference.
`,
  reorder_ordering_rules_root_subheader: `
Arrange ordering rules in descending order of preference.
`,
  reorder_feature_subheader: `
Select and move a feature higher or lower in the list.
`,
    reorder_purchase_options_subheader: `
Select and move a purchase options higher or lower in the list.
`,
    reorder_entitlement_subheader: `
Select and move a entitlements higher or lower in the list.
`,
  reorder_max_features_on: `
Maximal Number of Features On:
`,
    reorder_max_purchase_on: `
Maximal Number of {0}s On:
`,
  reorder_max_configs_on: `
Maximal Number of Configurations to Apply:
`,
  reorder_max_ordering_rule_on: `
Maximal Number of Ordering Rules to Apply:
`,

  reorder_max_configs_on_tooltip: `
Specify the maximal number of configurations that can be applied at the same time.
`,
  reorder_max_ordering_rules_on_tooltip: `
Specify the maximal number of ordering rules that can be applied at the same time.
`,

  reorder_max_features_on_tooltip: `
Specify the maximal number of features that can be \"on\" at the same time.
`,
    reorder_max_purchases_on_tooltip: `
Specify the maximal number of {0}s that can be \"on\" at the same time.
`,

  season_subheader: `
This version range will close the previous version range.
All features will be copied from the previous version range to the new version range.
`,
  season_min_version_title: "",
  season_min_version: "",
  season_max_version_title: "",
  season_max_version: "The version ranges from the Minimum Version up to (not including) the Maximum Version.",


  "User Groups": "These groups can be chosen when assigning the visibility of features and configurations in development.",
  "Products": "",
  "Products_title": "Products",
  "Features": "",
  feature_cell_mx_title: "Mutual Exclusion Group: Up to {0} of the following features can be \"on\" at the same time.",
    entitlement_cell_mx_title: "Mutual Exclusion Group: Up to {0} of the following entitlements can be \"on\" at the same time.",
    purchase_options_cell_mx_title: "Mutual Exclusion Group: Up to {0} of the following purchase options can be \"on\" at the same time.",
  purchase_cell_options_title: "Purchase Options:",
  purchase_cell_active_tooltip: "Entitlement is active",
  purchase_cell_not_active_tooltip: "Entitlement is not active",
    purchase_option_cell_active_tooltip: "Purchase option is active",
    purchase_option_cell_not_active_tooltip: "Purchase option is not active",

  edit_purchase_included_title: "To make this entitlement a bundle select additional entitlements to include",
  edit_purchase_included_tab_heading: "Bundle",
  edit_purchase_options__prod_ids_tab_heading: "Product ID",
  configuration_cell_title: "Configuration",
  configuration_cell_mx_title: "Mutual Exclusion Group: Up to {0} of the following configurations can be applied at the same time.",

  ordering_rule_cell_title: "Ordering Rules",
  ordering_rule_cell_mx_title: "Mutual Exclusion Group: Up to {0} of the following ordering rules can be applied at the same time.",
  add_ordering_rule_namespace: "A prefix for the ordering rule name that allows you to group related ordering rules together.",
  add_ordering_rule_group: "The ordering rule will be visible to the internal user groups specified here.",
  add_ordering_rule_min_app_version: "The minimum version of the app for which this ordering rule is tested and should be enabled.",

  add_configuration_subheader: "",
  add_configuration_namespace_title: "",
  add_configuration_namespace: "A prefix for the configuration name that allows you to group related configurations together.",
  add_configuration_name_title: "",
  add_configuration_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_configuration_group_title: "",
  add_configuration_group: "The configuration will be visible to the internal user groups specified here.",
  add_configuration_description_title: "",
  add_configuration_description: "",
  add_configuration_enabled_title: "",
  add_configuration_enabled: "",

  add_configuration_to_group_subheader: "This configuration cannot be applied at the same time as the configurations in the selected group.",
  add_configuration_to_mx_group_subheader: "In a mutual exclusion group, up to the first N configurations that meet their criteria can be applied. N is the maximal number of configurations that can be applied at the same time.",
  add_ordering_rule_to_mx_group_subheader: "In a mutual exclusion group, up to the first N ordering rules that meet their criteria can be applied. N is the maximal number of ordering rules that can be applied at the same time.",

  add_configuration_min_app_version_title: "",
  add_configuration_min_app_version: "The minimum version of the app for which this configuration is tested and should be enabled.",
  edit_utils_title: "Utilities",
  edit_utils_message_succuss_move_to_prod: "Utility released to production successfully",
  edit_utils_message_succuss_move_to_dev: "Utility reverted to development successfully",
  edit_utils_message_succuss_delete: "Utility deleted",
  edit_utils_message_succuss_added: "Utility added",
  edit_utils_message_succuss_updated: "Utility updated",
  edit_input_schema_title: "Edit Input Schema",
  edit_input_schema_leading_text_1: "The Input Schema is a ",
  edit_input_schema_leading_text_2: "that defines the fields you can use in rules and configurations.",
  edit_input_schema_learn_more: "Learn more...",
  import_features_title: "Import Features",
  import_purchases_title: "Import Entitlements",
  import_strings_title: "Import Strings",
  import_features_tab_title: "Import",
  import_strings_tab_title: "Import",
  paste_features_title: "Paste Feature - ",
  paste_purchases_title: "Paste Entitlement - ",
  paste_strings_title: "Paste Strings",
  paste_features_tab_title: "Paste",
  paste_strings_tab_title: "Paste",
  import_features_select_file:"Select a file to upload. Then, click Validate.",
  import_features_select_parent:"Select a parent feature in the hierarchy.",
  import_purchases_select_parent:"Select a parent entitlement in the hierarchy.",
  import_features_provide_suffix:"Add a suffix to the feature name to make it unique.\n",
  import_purchases_provide_suffix:"Add a suffix to the entitlement name to make it unique.\n",
  import_features_change_suffix:"Add a different suffix to the feature name to make it unique.\n",
  import_purchases_change_suffix:"Add a different suffix to the entitlement name to make it unique.\n",
  import_features_missing_assets:"The destination product is missing assets in the following features. Add these assets to the product, then try pasting again.\n",
  import_purchases_missing_assets:"The destination product is missing assets in the following entitlements. Add these assets to the product, then try pasting again.\n",
  import_features_missing_utils:"The destination product is missing the following utilities. Add these utilities to the product, then try pasting again.\n",
  import_features_missing_fields:"The destination product is missing the following context fields. Add these context fields to the product, then try pasting again.\n",
  import_features_provide_minapp_exceed_max:"The feature's Minimum App Version exceeds the current version range. Enter a Minimum App Version that is less than the Maximum Version of the current version range.\n",
  import_purchases_provide_minapp_exceed_max:"The entitlement's Minimum App Version exceeds the current version range. Enter a Minimum App Version that is less than the Maximum Version of the current version range.\n",
  add_context_to_whitelist_title: "Context Fields for Analytics",
  add_attributes_to_whitelist_title: "Report attributes for data collection",
  add_context_to_whitelist_details: "Select context fields for data collection.",
  data_collection_summary: "Data Collection Summary",
  import_feature_details_accordion_title: "Details",
  import_feature_preview_accordion_title_not_available: "Preview not available",
  import_feature_preview_accordion_title_available: "Preview",
  suffix_description_title: "",
  suffix_description_content: "Add a suffix to the feature name to make it unique. This suffix will also be applied to all elements under the feature.",
  suffix_description_content_purchase: "Add a suffix to the entitelment name to make it unique. This suffix will also be applied to all elements under the entitelment.",
  overwrite_strings_title: "",
  overwrite_strings_content_paste: "Some strings in the target location do not match the strings that you are pasting.\nYou can paste and overwrite the string conflicts, or paste non-conflicting strings only.\nIf you overwrite strings, all data including translations (even the ones set manually) will be replaced by the pasted string values.",
  overwrite_strings_content_import: "Some strings in the target location do not match the strings that you are importing.\nYou can import and overwrite the string conflicts, or import non-conflicting strings only.\nIf you overwrite strings, all data including translations (even the ones set manually) will be replaced by the imported string values.",
  copystrings_description_title: "",
  copystrings_description_content: "Copy the strings used by the feature. In case of conflicts, the suffix will be added to the new strings, and the feature will be updated",
  copystrings_conflict_prefix: "The following strings will not be pasted because their source and destination values do not match:\n",
  copystrings_size_limit: "The maximum number of strings to copy was exceeded. You can select a maximum of 100 strings.\n",
  minapp_description_title: "",
  minapp_description_content: "The feature's Minimum App Version must be less than the Maximum Version of the current version range.",
  minapp_description_content_purchase: "The entitlement's Minimum App Version must be less than the Maximum Version of the current version range.",
  analytics_delete_custom_attribute: "Delete custom attribute",
  analytics_add_custom_attribute: "+ Add Custom Attribute",
  analytics_array_attribute: "'ARRAY' attribute. Click the field to select array elements to report (ex: 1-5,8,11-14)",
  analytics_custom_attribute: "'CUSTOM' attribute. Click the field to define an expression (ex: big.label.size[5])",
  analytics_report_attributes_leading_txt_details: "Specify attributes for analytics. You can select attributes, choose elements of array-type attributes, and add custom attributes.",
  notifications_follow_tooltip_products: "Click to follow all production changes.",
  notifications_unfollow_tooltip_products: "Following all production changes. Click to stop following.",
  notifications_follow_tooltip: "Click to follow",
  notifications_unfollow_tooltip: "Click to stop following",
  notification_cannot_follow_tooltip: "Cannot follow a feature that does not exist in the master branch",
  notifications_nonAuth_tooltip: "User must be logged in to an authenticated server",
  notifications_follow_feature_success: "Following the feature {0}",
  notifications_unfollow_feature_success: "Stopped following the feature {0}",
    notifications_follow_purchase_option_success: "Following the purchase option {0}",
    notifications_unfollow_purchase_option_success: "Stopped following the purchase option {0}",
    notifications_follow_entitlement_success: "Following the entitlement {0}",
    notifications_unfollow_entitlement_success: "Stopped following the entitlement {0}",
  notifications_follow_feature_error: "Failed to follow feature",
  notifications_unfollow_feature_error: "Failed to stop following feature",
    notifications_follow_purchase_option_error: "Failed to follow purchase option",
    notifications_unfollow_purchase_option_error: "Failed to stop following purchase option",
    notifications_follow_entitlement_error: "Failed to follow entitlement",
    notifications_unfollow_entitlement_error: "Failed to stop following entitlement",
  notifications_follow_product_success: "Following production changes to product {0}",
  notifications_unfollow_product_success: "Stopped following the product {0}",
  notifications_follow_product_error: "Failed to follow product",
  notifications_unfollow_product_error: "Failed to stop following product",
  analytics_edit_this_value: "edit this value",
  edit_change_production_feature:"Are you sure you want to change this feature in production?",
  edit_change_production_entitlement:"Are you sure you want to change this entitlement in production?",
  edit_change_production_purchase_option:"Are you sure you want to change this purchase option in production?",
  edit_change_production_ordering_rule:"Are you sure you want to change this ordering rule in production?",
  edit_change_production_configuration:"Are you sure you want to change this configuration in production?",
  reorder_mx_change_production_feature:"Are you sure you want to reorder the mutual exclusion group with a feature in production?",
  analytics_stop_report_feature:'Stop sending the status (on/off) of feature \'',
  analytics_stop_report_entitlement:'Stop sending the status (on/off) of entitlement \'',
  analytics_stop_report_purchase_option:'Stop sending the status (on/off) of purchase option \'',
  analytics_report_feature: 'Send the status (on/off) of feature \'',
  analytics_report_entitlement: 'Send the status (on/off) of entitlement \'',
  analytics_report_purchase_option: 'Send the status (on/off) of purchase option \'',
  analytics_report_feature_suffix:'\' to analytics?',
  analytics_stop_report_config: 'Stop sending the rule status (triggered or not) of configuration \'',
  analytics_stop_report_ordering_rule: 'Stop sending the rule status (triggered or not) of ordering rule \'',
  analytics_report_config: 'Send the rule status (triggered or not) of configuration \'',
  analytics_report_ordering_rule: 'Send the rule status (triggered or not) of ordering rule \'',
  analytics_report_config_suffix:'\' to analytics?',
  analytics_summary_leading_txt_1: "The following data will be sent to analytics. You can send a total of",
  analytics_report_leading_txt_1: "You can send a total of",
  analytics_summary_leading_txt_2: "context fields, features, configurations, and attributes in production.",
  analytics_summary_leading_txt_total: "Current number of items selected for analytics in production:",
  analytics_summary_leading_dev_txt_total: "Current number of items selected for analytics in development:",
  analytics_summary_context_field_tooltip_title: "",
  analytics_summary_context_field_tooltip: "Items in gray are being sent to analytics from the master branch.",
  analytics_summary_features_field_tooltip_title: "",
  analytics_summary_features_field_tooltip: "Items in gray are being sent to analytics from the master branch.",
  analytics_no_context_selected: "No context fields selected for analytics",
  analytics_no_attributes_selected: "No items selected for analytics",
  analytics_summary_context_leading_txt_1: "Select context fields to send to analytics. You can send a total of ",
  analytics_summary_context_leading_txt_2: "context fields, features, configurations, and attributes in production.",
  analytics_summary_context_leading_txt_3: "Current number of items selected for analytics in production:",
  analytics_summary_context_leading_txt_4: "Current number of items selected for analytics in development:",
  analytics_summary_context_leading_txt_5: "Number of selected context fields: ",
  analytics_summary_context_learn_more: "Learn more...",
    analytics_summary_context_warning: " context fields are selected for analytics. Do you want to continue?",
  analytics_summary_attribute_deleted_warning: "This attribute will not be sent to analytics because it was removed from the feature configuration or its type was changed. To remove the attribute from the Data Collection Summary: Click the Action button on the parent feature, select Report attributes, and clear the check box next to the attribute.",
  analytics_no_attributes_available: "No attributes available for analytics",
  import_required_help: "* Indicates required fields",

  product_details_not_including_label: "The version ranges from the minimum version to (not including) the maximum version",
  feature_cell_click_to_send_to_analytics:"Click to send the feature's status (on/off) to analytics",
  entitlement_cell_click_to_send_to_analytics:"Click to send the entitlement's status (on/off) to analytics",
  order_cell_click_to_send_to_analytics:"Click to send the rule status (triggered or not) to analytics",
  configuration_cell_click_to_send_to_analytics:"Click to send the rule status (triggered or not) to analytics",
  feature_cell_sending_something_click_to_not_send_to_analytics:"Currently sending the feature's status (on/off) and associated data (configurations and attributes) to analytics. Click to stop sending the feature's status to analytics.",
    entitlement_cell_sending_something_click_to_not_send_to_analytics:"Currently sending the entitlement's status (on/off) and associated data (configurations and attributes) to analytics. Click to stop sending the entitlement's status to analytics.",
  order_cell_sending_something_click_to_not_send_to_analytics:"Click to stop sending the rule status (triggered or not) to analytics",
  configuration_cell_sending_something_click_to_not_send_to_analytics:"Click to stop sending the rule status (triggered or not) to analytics",
  feature_cell_click_to_not_send_to_analytics:"Click to stop sending the feature's status to analytics",
    entitlement_cell_click_to_not_send_to_analytics:"Click to stop sending the entitlement's status to analytics",
  feature_cell_sending_something_click_to_send_to_analytics:"Currently sending data associated with the feature (configurations and attributes) to analytics. Click to also send the feature's status (on/off) to analytics.",
    entitlement_cell_sending_something_click_to_send_to_analytics:"Currently sending data associated with the entitlement (configurations and attributes) to analytics. Click to also send the entitlement's status (on/off) to analytics.",
  feature_cell_premium_tooltip: "This feature is defined as premium",
  feature_cell_click_to_send_to_analytics_disabled:"The feature's status (on/off) is not being sent to analytics",
    entitlement_cell_click_to_send_to_analytics_disabled:"The entitlement's status (on/off) is not being sent to analytics",
  feature_cell_sending_something_click_to_not_send_to_analytics_disabled:"Sending the feature's status (on/off) and associated data (configurations and attributes) to analytics.",
    entitlement_cell_sending_something_click_to_not_send_to_analytics_disabled:"Sending the entitlement's status (on/off) and associated data (configurations and attributes) to analytics.",
  feature_cell_click_to_not_send_to_analytics_disabled:"Sending the feature's status to analytics",
    entitlement_cell_click_to_not_send_to_analytics_disabled:"Sending the entitlement's status to analytics",
  feature_cell_sending_something_click_to_send_to_analytics_disabled:"Sending data associated with the feature (configurations and attributes) to analytics. The feature's status (on/off) is not being sent to analytics.",
    entitlement_cell_sending_something_click_to_send_to_analytics_disabled:"Sending data associated with the entitlement (configurations and attributes) to analytics. The entitlement's status (on/off) is not being sent to analytics.",
  feature_cell_new_in_branch_tooltip:"This feature is only in the branch, not in the master",
    entitlement_cell_new_in_branch_tooltip:"This entitlement is only in the branch, not in the master",
    purchase_option_cell_click_to_send_to_analytics:"Click to send the purchase option's status (on/off) to analytics",
    purchase_option_cell_sending_something_click_to_not_send_to_analytics:"Currently sending the purchase option's status (on/off) and associated data (configurations and attributes) to analytics. Click to stop sending the purchase option's status to analytics.",
    purchase_option_cell_click_to_not_send_to_analytics:"Click to stop sending the purchase option's status to analytics",
    purchase_option_cell_sending_something_click_to_send_to_analytics:"Currently sending data associated with the purchase option (configurations and attributes) to analytics. Click to also send the purchase option's status (on/off) to analytics.",
    purchase_option_cell_click_to_send_to_analytics_disabled:"The purchase option's status (on/off) is not being sent to analytics",
    purchase_option_cell_sending_something_click_to_not_send_to_analytics_disabled:"Sending the purchase option's status (on/off) and associated data (configurations and attributes) to analytics.",
    purchase_option_cell_click_to_not_send_to_analytics_disabled:"Sending the purchase option's status to analytics",
    purchase_option_cell_sending_something_click_to_send_to_analytics_disabled:"Sending data associated with the purchase option (configurations and attributes) to analytics. The purchase option's status (on/off) is not being sent to analytics.",
    purchase_option_cell_new_in_branch_tooltip:"This purchase option is only in the branch, not in the master",
  mark_for_translation_title:"Mark Strings for Review",
  mark_for_translation_leading_txt:"Select strings that are ready to be reviewed.",
  send_for_translation_title:"Send Strings to Translation",
  send_for_translation_leading_txt:"Select strings to send to translation.",
  copy_strings_title:"Copy Strings",
  export_strings_title:"Export Strings",
  copy_strings_leading_txt:"Select strings to copy.",
  export_strings_leading_txt:"Select strings to export and the file format (Android, iOS, or JSON).",
  export_size_limit: "The maximum number of strings to export was exceeded. You can select a maximum of 100 strings.\n",
  export_type_unavailable: "Select the export format. \n",
  review_for_translation_title:"Complete Review",
  review_for_translation_leading_txt:"Select strings that are reviewed and ready for translation.",
  review_for_translation_success_message:"String reviewed for translation",
  mark_for_translation_success_message:"String marked for review",
  sent_for_translation_success_message:"String sent for translation",

  string_key_tooltip:"The key that is used to refer to the string in the translate() function.",
  string_value_tooltip:"The string (in English) to translate.",
  string_fallback_tooltip:"Optional string that is displayed when a string is not yet translated into a supported language. If no international fallback is specified, the English string is displayed.",
  string_translationInstruction_tooltip:"Include relevant information such as the due date. Example: Capitalize if language allows. Due date: July 1, 2017",
  string_maxSize_tooltip:"Optional: Specify the maximum number of characters for string translations.",

  cannot_modify_production_string:"You do not have sufficient permissions to modify this string.",
  cancel_override_string_explanation:"This action reverts the string to the previous translation.",
  cancel_override_string_explanation_title:"",

  page_top_new_branch_tooltip:"Create new branch",
  page_top_cannot_create_new_branch_tooltip:"This version range does not support creating branches",
  page_top_airlock_version:"v5.5",
  experiments_header_text:"Only 1 of these experiments can run on each device",
  experiment_cell_variants_title: "Variants: Only 1 of the following variants will be applied at the same time.",
  experiment_cell_master_variant: "If no variant is 'on' for a device, it will fall back to the master branch",
  experiment_move_to_production_without_control: `Control group is not defined. It is highly recommended that you define one for the experiment.
                                                  Continue anyway?`,

  streams_header_text:"",
  edit_stream_filter_tab_heading:"Filter",
  edit_stream_processor_tab_heading:"Processor",
  edit_stream_schema_tab_heading: "Result Schema",
  edit_stream_filter_tab_details:"Set conditions in JavaScript that determine which events will be handled by the Processor.",
  edit_stream_processor_tab_details:"Given an array of events that passed the Filter, build a JavaScript result object that will be used as input for rules.",
  edit_stream_schema_tab_details: "Define a schema that describes the result object created by the Processor.",
  edit_stream_no_intellisense: "There is no sample event data in the system that matches the current filter. The processor will not be fully validated.",
  notifications_delete_feature_error: "Failed to delete branch",
  notifications_delete_feature_success: "Branch deleted successfully",
  verify_remove_from_branch_title: "Are you sure you want to cancel the checkout?",
  verify_remove_from_branch_message: "All changes made to the feature in this branch will be lost.",
  verify_remove_from_branch_message_type_parm: "All changes made to the {0} in this branch will be lost.",
  verify_remove_from_branch_apply_all: "Also cancel the checkout of subfeatures (if any)",
  verify_remove_from_branch_apply_all_type_parm: "Also cancel the checkout of sub{0}s (if any)",
  tooltip_mandatory_field: "Required field",
  translation_season_not_support:"The current version range does not support translation statuses.",
  verify_action_modal_recursive_stage_change: "Revert subfeatures and configurations in the production stage to the development stage (applies to new or checked out items only). All subfeatures and configurations in production must be checked out.",
  confirm_recursive_tooltip:"Select the check box to proceed",
  add_stream_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_stream_group_title: "",
  add_stream_group: "The Stream will be visible to the internal user groups specified here.",
  add_stream_min_app_version: "The minimum version of an app on which the Stream can be run.",
  edit_stream_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  edit_stream_group_title: "",
  edit_stream_min_app_version: "The minimum version of an app on which the Stream can be run.",

  edit_stream_title: "Edit Stream",
  edit_stream_stage: "Either DEVELOPMENT or PRODUCTION",
  edit_stream_stage_title: "",
  edit_stream_name_title: "",
  edit_stream_rollout: "The percentage of users who will see this stream. You can enter a value with up to 4 decimal places.",
  edit_stream_rollout_title: "",
  edit_stream_enabled_title: "",
  edit_stream_enabled: "",
  edit_stream_groups_title: "",
  edit_stream_groups: "The Stream will be visible to the internal user groups specified here.",
  edit_stream_description_title: "",
  edit_stream_description: "",
  edit_stream_creator_title: "",
  edit_stream_creator: "",
  edit_stream_creation_date_title: "",
  edit_stream_creation_date: "",
  edit_stream_last_modified_title: "",
  edit_stream_last_modified: "",
    streams_season_not_supported: "This version range does not support streams.",
  edit_stream_rule_tab_heading: "Rule",
  edit_stream_rule_tab_details: "Enter rules in JavaScript based on contextual data like weather, location, and the user’s profile.",
  edit_stream_rule_tab_learn_more: "Learn more...",
  edit_stream_description_tab_heading: "Description",
  edit_stream_error_min_stream_bigger_max_version: "The stream's minimum version is greater or equal than the maximum version in the product version range.",
    stream_cell_disable_message:"Are you sure you want to disable this stream ({0})? All data processed on the device for this stream will be deleted",
    stream_cell_enable_message:"Are you sure you want to enable this stream ({0})? ",
  edit_change_production_stream:"Are you sure you want to change this stream in production?",
  edit_change_production_notification:"Are you sure you want to change this webhook in production?",
    experiment_stop_indexing: 'Pause indexing the experiment \'',
    experiment_stop_indexing_suffix:'\'?',
    experiment_start_indexing: 'Start indexing the experiment \'',
    experiment_start_indexing_suffix:'\'?',
    experiment_start_indexing_tooltip:'Click to start gathering data for the dashboard',
    experiment_cant_start_indexing_tooltip:'Add variants and mark one as the control group',
    experiment_cant_start_indexing_old_version:'The experiment must be upgraded to run indexing. Contact your system administrator for assistance.',
    experiment_cant_start_indexing_enable:'To index, enable the experiment',
    experiment_cant_start_indexing_variants:'To index, add variants to the experiment',
    experiment_indexing_was_paused:'Indexing was paused',
    edit_utils_release_to_prodution:'Release to production',
    edit_utils_revert_to_development:'Revert to development',
    edit_utils_leading_text:"Utilities can contain multiple JavaScript functions. The last function definition overrides any previous declarations of the same name.",
    edit_utils_select_util:'',
    edit_utils_select_util_title:'Select a utility to edit:',
  reset_dashboard_alert_title:'Are you sure you want to reset the dashboard?',
  reset_dashboard_alert_message:'Any changes that were made to the dashboard will be lost.',
  add_notification_name_title:'',
  add_notification_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  add_notification_title: "The title of the webhook that will be displayed in the app.",
  add_notification_title_title:'',
  add_notification_group_title: "",
  add_notification_group: "The webhook will be visible to the internal user groups specified here.",
  add_notification_min_app_version: "The minimum version of an app on which the webhook can be run.",
  add_webhook_url: "",
  add_webhook_url_title:"",
  add_webhook_name_title:'',
  add_webhook_products: "",
  add_webhook_products_title:"",
  add_webhook_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
    edit_webhook_minStage: "",
    edit_webhook_minStage_title: "",
  limit_notifications_subheader: `
Limit the total number of notifications on the device.
`,

  edit_notification_name: `
Names can contain English letters, digits, spaces, and periods only.
The name must start with a letter.
`,
  notifications_season_not_supported: "This version range does not support notifications.",
  edit_notification_group_title: "",
  edit_notification_min_app_version: "The minimum version of an app on which the webhook can be run.",
  edit_notification_title: "Edit Notification",
  edit_notification_stage: "Either DEVELOPMENT or PRODUCTION",
  edit_notification_stage_title: "",
  edit_notification_name_title: "",
  edit_notification_rollout: "The percentage of users who will see this webhook. You can enter a value with up to 4 decimal places.",
  edit_notification_rollout_title: "",
  edit_notification_enabled_title: "",
  edit_notification_enabled: "",
  edit_notification_groups_title: "",
  edit_notification_groups: "The webhook will be visible to the internal user groups specified here.",
  edit_notification_description_title: "",
  edit_notification_description: "",
  edit_notification_creator_title: "",
  edit_notification_creator: "",
  edit_notification_creation_date_title: "",
  edit_notification_creation_date: "",
  edit_notification_last_modified_title: "",
  edit_notification_last_modified: "",
  edit_notification_limit_title: "",
  edit_notification_limit: "",
  edit_notification_max_title: "",
  edit_notification_max: "",
  edit_notification_rule_tab_heading:"Rules",
  edit_notification_rule_tab_details:"Enter rules in JavaScript. The Registration Rule determines the conditions for scheduling the webhook. The Cancellation Rule determines the conditions for unscheduling the webhook.",
  edit_notification_rule_tab_details_cancellation:"Cancellation Rule",
  edit_notification_rule_tab_details_registration:"Registration Rule",
  edit_notification_configuration_tab_heading: "Configuration",
  edit_notification_configuration_tab_details:"The Configuration is a set of parameters that determines the behavior and appearance of the webhook in the app.",
  edit_notification_configuration_configuration_edit_title: "Schema",
  edit_notification_config_schema_title: "",
  edit_notification_config_schema: "",
  edit_notification_input_schema_edit_title: "Configuration",
  edit_notification_min_interval: "",
  edit_notification_min_interval_title: "",
  edit_notification_input_schema_title: "",
  edit_notification_input_schema_schema: "",
  edit_notification_limit_notification:"Limit Notification:",
  edit_notification_limit_occurrenceA:"Show a maximum of",
  edit_notification_limit_occurrenceB:"notifications",
  edit_notification_limit_occurrenceC:"per device",
  edit_webhook_title:" Edit Webhook",
  notifications_header_text:"",
  have_max_limitations:"Maximum limitations reached",
    iOS:"Constants for iOS",
    Android: "Constants for Java/Android",
    c_sharp: "Constants for C#",
    import_strings_format:"This option will prevent replacing the placeholders in the strings with Airlock's format",
    import_strings_format_title:"",
    import_strings_format_label:"Preserve original placeholders"
};
