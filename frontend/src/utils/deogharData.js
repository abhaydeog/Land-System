// src/utils/deogharData.js
// Deoghar District — Complete Administrative Data

export const DISTRICT = "Deoghar";

export const SUBDIVISIONS = [
  "Deoghar Sadar",
  "Madhupur"
];

// 10 Blocks of Deoghar
export const BLOCKS = [
  "Deoghar",
  "Devipur",
  "Mohanpur",
  "Sarwan",
  "Sonaraithari",
  "Madhupur",
  "Sarath",
  "Palajori",
  "Karown",
  "Margomunda"
];

// Circles (same as blocks in Deoghar)
export const CIRCLES = [
  "Deoghar Circle",
  "Devipur Circle",
  "Mohanpur Circle",
  "Sarwan Circle",
  "Sonaraithari Circle",
  "Madhupur Circle",
  "Sarath Circle",
  "Palajori Circle",
  "Karown Circle",
  "Margomunda Circle"
];

// Thanas (Police Stations) of Deoghar
export const THANAS = [
  "Deoghar Town",
  "Baba Mandir",
  "Jasidih",
  "Mohanpur",
  "Sonaraithari",
  "Madhupur",
  "Sarath",
  "Karown",
  "Palajori",
  "Margomunda",
  "Sarwan",
  "Devipur",
  "Chittaranjan (RPF)"
];

// Block → Thana mapping
export const BLOCK_THANA_MAP = {
  "Deoghar":       ["Deoghar Town", "Baba Mandir", "Jasidih"],
  "Devipur":       ["Devipur"],
  "Mohanpur":      ["Mohanpur"],
  "Sarwan":        ["Sarwan"],
  "Sonaraithari":  ["Sonaraithari"],
  "Madhupur":      ["Madhupur"],
  "Sarath":        ["Sarath"],
  "Palajori":      ["Palajori"],
  "Karown":        ["Karown"],
  "Margomunda":    ["Margomunda"]
};

// Block → Villages (major ones)
export const BLOCK_VILLAGES = {
  "Deoghar":       ["Deoghar", "Jasidih", "Mohanpur Road", "Rikhia", "Trikut"],
  "Devipur":       ["Devipur", "Amgachi", "Nona", "Barmasiya"],
  "Mohanpur":      ["Mohanpur", "Dahijor", "Panchudih", "Amtala"],
  "Sarwan":        ["Sarwan", "Banjhi", "Khaira", "Tinpahar Road"],
  "Sonaraithari":  ["Sonaraithari", "Barachatti", "Bahiyar"],
  "Madhupur":      ["Madhupur", "Vidyasagar", "Chittaranjan", "Gidhour"],
  "Sarath":        ["Sarath", "Khijuri", "Palamu", "Barbigha"],
  "Palajori":      ["Palajori", "Amgaon", "Chandankyari"],
  "Karown":        ["Karown", "Bagodar", "Madanpur"],
  "Margomunda":    ["Margomunda", "Pathrol", "Dhawatand"]
};

// Complaint Types relevant to land disputes
export const COMPLAINT_TYPES = [
  "Seema Vivad (Boundary Dispute)",
  "Naap-Jokh Galat (Wrong Survey)",
  "Daakhal / Kabza (Encroachment)",
  "Naksha Sudhar (Map Correction)",
  "Vanshanusar Haqqum (Inheritance Rights)",
  "Parijdan / Transfer (Mutation)",
  "Sarkari Bhumi Par Daava (Govt Land Claim)",
  "Bhumi Adhigrahan Vivad (Acquisition Dispute)",
  "Jamabandi Sudhar (Revenue Record Correction)",
  "Rasid / Lagaan Vivad (Revenue Receipt Dispute)",
  "Anya (Other)"
];

export const PRIORITIES = ["Neem", "Madhyam", "Uchcha", "Atyadhik Uchcha"];

export const LAND_TYPES = [
  "Krishi Bhumi (Agricultural)",
  "Aavaasiya (Residential)",
  "Vaanijyik (Commercial)",
  "Vanadhikar (Forest Rights)",
  "Sarkari (Government)",
  "Gairmazarua (Common Land)",
  "Anya (Other)"
];
