import React from "react";

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard! Here you can manage your content and settings.</p>

      {/* Settings Widget */}
      <div className="settings-widget border p-4 rounded-lg shadow-md my-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p>Manage your application settings.</p>
        {/* Add more settings controls here */}
      </div>

      {/* Edit Image Widget */}
      <div className="edit-image-widget border p-4 rounded-lg shadow-md my-4">
        <h2 className="text-xl font-semibold">Edit Image</h2>
        <p>Upload and edit your images.</p>
        {/* Add image editing tools here e.g., file upload button */}
      </div>

      {/* Profile Widget */}
      <div className="profile-widget border p-4 rounded-lg shadow-md my-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p>Update your personal information and profile picture.</p>
        {/* Add profile management options here */}
      </div>
    </div>
  );
}