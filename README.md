# Mentry

## Prerequisites
Before starting, make sure you have [Git](https://git-scm.com/) installed, Python with pip, and Node.js with npm.

## Setup Instructions

1. **Clone the Repository**

   Open your terminal and run:

   ```sh
   git clone <repository-url>
   cd horizon
   ```

2. **Install Python Dependencies**

   Run the following command to install required Python packages:

   ```sh
   pip install -r requirements.txt
   ```

3. **Update Environment Variables**

   Replace the contents of the **.env** file with the following environment variables:

4. **Install Node Dependencies**

   Run the following command to install node modules:

   ```sh
   npm install
   ```

5. **Start the Development Server**

   Run the following command:

   ```sh
   npm run dev
   ```

   Then open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Using the Application

1. On the homepage, click **Get Started/ Signup**.
2. Create an account by signing up.
3. In the search bar:
   - Write about your feelings.
   - Select the emoji for your mood.
   - Click **Go**.

   You'll see a loading indication while the story is generated (this may take some time).

4. Once the story is generated:
   - Click **Play Story**.
   - Click **Next Chapter** to generate subsequent chapters. Note that when the story ends, you won't be able to advance further.
   - Click **View Stories** to see all generated stories.
   - On the story page, use the chatbox to enter additional suggestions to alter the forward story. Simply type your suggestion and press **Enter**.

Enjoy generating and exploring your unique stories!
