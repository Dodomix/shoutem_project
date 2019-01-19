
### Development

To prepare the app, first run `yarn setup` which will run `yarn install` in all the necessary directories and install 
dependencies.

After that, keys will need to be generated to use with `jsonwebtoken`. To generate these, first run, without specifying 
a passphrase:

    ssh-keygen -t rsa -b 4096 -f private.pem

This will generate two keys, `private.pem` and `private.pem.pub`. `private.pem.pub` is not in the 
expected format for `jsonwebtoken` so to remove it and create the correct public key, you can run:

    rm private.pem.pub
    openssl rsa -in private.pem -pubout -outform PEM -out public.pem
    mv public.pem communicator/


After this, you can start all apps by running `yarn dev`. This will start two servers 
(one for the main app and one for the minor iframe apps), the main app and the iframe apps. Ports 3000-3002, 5000 will be taken with the main app running on port 3000.

##### Quality of life

To stop React from opening a browser tab for each application, you can create `.env` files in the directories of apps
you prefer not be opened (recommended for the `player` app) with the following
content:

    BROWSER=none