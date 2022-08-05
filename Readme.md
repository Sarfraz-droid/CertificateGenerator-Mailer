# Certificate Generator

### Setup

#### Step 1 
run git clone
```bash
git clone https://github.com/IEEE-CS-JMI-Student-Chapter/CertificateGenerator-Mailer.git
```

#### Step 2
run npm install
```bash
npm install
```
or if you're using yarn
```bash
yarn
```

#### Step 3
**Setup Oauth Credentials**
- Copy ```.env.sample``` and rename to ```.env```.
- Setup environment variables for your Oauth credentials.
i.e
```bash 
user=<user>
CLIENT_ID=<CLIENT_ID>
CLIENT_SECRET=<CLIENT_SECRET>
REDIRECT_URL=http://localhost:8001/
```

- user - the email address of the oauth user
- CLIENT_ID - the client id of the oauth user
- CLIENT_SECRET - the client secret of the oauth user
- REDIRECT_URL - the redirect url of the oauth user(Add http://localhost:8001/ as the redirect uri in your oauth credentials)
- You can find the oauth credentials in the [Google Developers Console](https://console.cloud.google.com/apis/credentials/consent).

#### Step 4
If you have completed the Step 3 then run
```bash
npm run oauth
```
- Follow the instructions to login to your google account and authorize the application.
- You will be redirected to the redirect url.
- Then this will redirect you to the localhost:8001/oauth/callback
- Copy the code and paste it to the terminal
- Now, if done correctly, your oauth credentials will be saved in the ```tokens.json``` file.

#### Step 5
If you have completed the Step 4 then run
```bash
npm run app
```

- Now you can access the app, generate certificates and mail them.