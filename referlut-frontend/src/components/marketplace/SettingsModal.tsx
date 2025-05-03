import React, { useState } from "react";
import {
  X,
  Moon,
  Sun,
  Bell,
  Lock,
  Shield,
  User,
  Trash2,
  Globe,
  CreditCard,
} from "lucide-react";
import { User as UserType } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("english");
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [username, setUsername] = useState<string>(user.name);
  const [email, setEmail] = useState<string>("user@example.com");
  const [profileImage, setProfileImage] = useState<string>(user.avatar);
  const [revolut, setRevolut] = useState<string>("");

  if (!isOpen) return null;

  const tabs = [
    { id: "general", label: "General", icon: <Globe className="w-5 h-5" /> },
    { id: "account", label: "Account", icon: <User className="w-5 h-5" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    { id: "privacy", label: "Privacy", icon: <Lock className="w-5 h-5" /> },
    { id: "security", label: "Security", icon: <Shield className="w-5 h-5" /> },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-60 border-r bg-gray-50 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab("delete")}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Delete Account
                </button>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  General Settings
                </h3>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-800">
                      Dark Mode
                    </h4>
                    <p className="text-sm text-gray-500">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      darkMode ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                    {darkMode ? (
                      <Moon className="absolute right-1 h-3 w-3 text-blue-100" />
                    ) : (
                      <Sun className="absolute left-1 h-3 w-3 text-yellow-400" />
                    )}
                  </button>
                </div>

                {/* Language Selection */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 mb-2">
                    Language
                  </h4>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="english">English (UK)</option>
                    <option value="english-us">English (US)</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Account Settings
                </h3>

                {/* Profile Picture */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 mb-3">
                    Profile Picture
                  </h4>
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors">
                        <User className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="ml-5">
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Change Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Notification Settings
                </h3>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive email updates about your activity
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationsEnabled(!notificationsEnabled)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notificationsEnabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span className="sr-only">Enable notifications</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationsEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        Push Notifications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive push notifications about your activity
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600`}
                    >
                      <span className="sr-only">Enable push notifications</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6`}
                      />
                    </button>
                  </div>

                  {/* Marketing Communications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        Marketing Communications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive updates about new features and promotions
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200`}
                    >
                      <span className="sr-only">
                        Enable marketing communications
                      </span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Privacy Settings
                </h3>

                <div className="space-y-4">
                  {/* Profile Visibility */}
                  <div>
                    <h4 className="text-base font-medium text-gray-800 mb-2">
                      Profile Visibility
                    </h4>
                    <select className="block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500">
                      <option value="public">
                        Public - Anyone can see your profile
                      </option>
                      <option value="restricted">
                        Restricted - Only users you share offers with
                      </option>
                      <option value="private">
                        Private - Only you can see your profile
                      </option>
                    </select>
                  </div>

                  {/* Search Engine Visibility */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        Search Engine Visibility
                      </h4>
                      <p className="text-sm text-gray-500">
                        Allow search engines to index your profile
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200`}
                    >
                      <span className="sr-only">
                        Enable search engine visibility
                      </span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`}
                      />
                    </button>
                  </div>

                  {/* Data Usage */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        Data Usage for Personalization
                      </h4>
                      <p className="text-sm text-gray-500">
                        Allow us to use your data to personalize your experience
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600`}
                    >
                      <span className="sr-only">Enable data usage</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Security Settings
                </h3>

                <div className="space-y-4">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-500">
                        Secure your account with 2FA
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200`}
                    >
                      <span className="sr-only">Enable 2FA</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`}
                      />
                    </button>
                  </div>

                  {/* Login History */}
                  <div>
                    <h4 className="text-base font-medium text-gray-800 mb-2">
                      Login History
                    </h4>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View login history
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h4 className="text-base font-medium text-gray-800 mb-2">
                      Active Sessions
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            London, UK (Current Device)
                          </p>
                          <p className="text-xs text-gray-500">
                            Last active: Just now
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Settings
                </h3>

                {/* Revolut Account Link */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 mb-2">
                    Revolut Account
                  </h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Enter your Revolut username"
                      value={revolut}
                      onChange={(e) => setRevolut(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Link
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Linking your Revolut account makes it easier to receive
                    payments for referrals.
                  </p>
                </div>

                {/* Payment Methods */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 mb-2">
                    Payment Methods
                  </h4>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                    <CreditCard className="w-4 h-4 mr-1" />
                    Add Payment Method
                  </button>
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 mb-2">
                    Payment History
                  </h4>
                  <p className="text-sm text-gray-500">
                    No payment history available.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "delete" && (
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-red-600">
                  Delete Account
                </h3>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-base font-medium text-red-800">
                    Warning: This action cannot be undone
                  </h4>
                  <p className="mt-2 text-sm text-red-700">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 border p-2 focus:border-red-500 focus:ring-red-500"
                      placeholder="DELETE"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter your password
                    </label>
                    <input
                      type="password"
                      className="block w-full rounded-md border-gray-300 border p-2 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
