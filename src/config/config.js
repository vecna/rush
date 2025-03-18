// src/config/config.js

module.exports = {
    dataPath: process.env.DATA_PATH || './arildata',
    databases: './databases',
    expectedKeys: ["phone_number", "name", "family_info", "abuse", "details", "UNHCR_number", "number_of_messages", "date_first_contact", "date_last_contact", "operator_name", "location", "location_detail", "authorities", "authority_role"],
};

