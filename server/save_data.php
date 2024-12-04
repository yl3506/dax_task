<?php
// Get the raw POST data
$json = file_get_contents('php://input');

// Decode the JSON data
$data = json_decode($json, true);

// Extract data fields
$participant_id = $data['participant_id'];
$start_time = $data['start_time'];
$completion_time = $data['completion_time'];
$csv_data = $data['csv_data'];

// Create the data directory if it doesn't exist
if (!file_exists('../data')) {
   mkdir('../data', 0777, true);
}

// Save the CSV data to a file
$filename = '../data/' . $participant_id . '.csv';

file_put_contents($filename, $csv_data);

// Send success response
echo 'Data saved successfully';
?>