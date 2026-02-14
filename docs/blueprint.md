# **App Name**: JapCounter Pro

## Core Features:

- User Authentication: Secure user login and registration using email/password and Google Sign-In with Firebase Authentication.
- Real-time Counter: Display a large, central counter value with increment, decrement, and reset functionalities.
- Target Goal Setting: Allow users to set a target goal (e.g., 108, 1008) with a progress indicator. Users may be reminded by notifications to increment their counter via push notifications using FCM and a LLM that acts as a tool, to intelligently enable/disable and customize the reminder notifications based on user behavior.
- Counter Persistence: Save counter values to Firebase Firestore under the user's account and load them automatically upon login. Sync data in real-time across devices.
- History Tracking: Show a daily counter history using RecyclerView, loading data from Firebase Firestore.
- Settings Customization: Enable/disable vibration and sound feedback, toggle dark mode, and provide a logout option.
- Accessibility Features: Include accessibility enhancements for users with disabilities such as alternative text for images, screen reader compatibility, and customizable UI.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), embodying serenity and focus.
- Background color: Very light indigo (#E8EAF6), ensuring a calm backdrop.
- Accent color: Muted violet (#7E57C2), used for interactive elements.
- Body and headline font: 'PT Sans', a versatile sans-serif for readability and a modern touch.
- Material Design icons for a clean and intuitive user interface.
- Modern Material Design layout with a focus on a clean, professional, and user-friendly experience. Support for both dark and light modes.
- Subtle animations for user interactions, such as button presses and data updates.