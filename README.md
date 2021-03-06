# WT Write API
API written in nodejs to interact with the Winding Tree
platform.

## Requirements
- Nodejs 10.7.x

### Getting stared
In order to install and run tests, we must:
```
git clone git@github.com:windingtree/wt-write-api.git
nvm install
npm install
npm test
```

### Running dev mode
With all the dependencies installed, you can start the dev server.

First step is to initialize the SQLite database used to store your settings.
If you want to use a different database, feel free to change the connection
settings in the appropriate configuration file in `src/config/`.
```bash
npm run createdb-dev
```

If you'd like to start fresh later, just delete the `.dev.sqlite` file.

Second step is starting Ganache (local Ethereum network node). You can skip this
step if you have a different network already running.
```bash
npm run dev-net
```

For trying out the interaction with the running dev-net and wt-write-api in general,
you can use the Winding Tree demo wallet protected by password `windingtree`.
It is initialized on `dev-net` with enough ether. For sample interaction scripts, check out our
[Developer guides](https://github.com/windingtree/wiki/tree/master/developer-guides).

**!!!NEVER USE THIS WALLET FOR ANYTHING IN PRODUCTION!!!** Anyone has access to it.

```js
{"version":3,"id":"7fe84016-4686-4622-97c9-dc7b47f5f5c6","address":"d037ab9025d43f60a31b32a82e10936f07484246","crypto":{"ciphertext":"ef9dcce915eeb0c4f7aa2bb16b9ae6ce5a4444b4ed8be45d94e6b7fe7f4f9b47","cipherparams":{"iv":"31b12ef1d308ea1edacc4ab00de80d55"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d06ccd5d9c5d75e1a66a81d2076628f5716a3161ca204d92d04a42c057562541","n":8192,"r":8,"p":1},"mac":"2c30bc373c19c5b41385b85ffde14b9ea9f0f609c7812a10fdcb0a565034d9db"}};
```

Now we can run our dev server.
```bash
npm run dev
```

When using a `dev` config, we internally run a script to deploy WT Index. It is not immediate,
so you might experience some errors in a first few seconds. And that's the reason why
it is not used in the same manner in integration tests.

You can fiddle with the configuration in `src/config/`.


### Running node against Ropsten testnet contract

- To make trying out the node even simpler, we prepared a Docker image pre-configured
to talk with one of our testing contracts deployed on Ropsten.
- You can use it in your local environment by running the following commands:
```sh
$ docker build -t windingtree/wt-write-api .
$ docker run -p 8080:8000 -d windingtree/wt-write-api
# Or you can run a different config with
$ docker run -p 8080:8000 -e WT_CONFIG=dev windingtree/wt-write-api
```
- After that you can access the wt-write-api on local port `8080`
- This deployment is using a Ropsten configuration that can be found in `src/config/ropsten`
- **Warning** - User wallets (although protected by password) will be stored in the image,
be careful where your API is running and who can access it.
- **Warning** - Once your docker container (and its associated volumes, if any) is deleted,
all accounts (wallets and configuration) will disappear.

### Replacing the 502 status code with a custom one

As this API serves mostly as an enhanced proxy further upstream
(be it Ethereum blockchain or the various off-chain storages),
there is a number of situations where the HTTP Bad Gateway
Status (502) is returned (signalling an upstream problem,
not a problem with the API itself).

However, depending on your setup, it might be sometimes
problematic to return HTTP 502 as part of legitimate
traffic. Therefore, you can use the `WT_BAD_GATEWAY_CODE`
environment variable to change the status code that is used
in these situations to something different.

## Examples

### Account setup

In order to use the API, you need to create an account that stores your configuration.
The account consists of Ethereum wallet in JSON format and a configuration of uploaders.
The uploaders are telling the API where to put data about hotels managed by that
Ethereum wallet. *The API does not store Wallet passwords.*

In this case, we are setting up swarm as our preferred storage, make sure it is 
actually accessible (via the `swarmProvider` gateway url from config) before you
try to create hotel.

```json
{
  "wallet": {"version":3,"id":"7fe84016-4686-4622-97c9-dc7b47f5f5c6","address":"d037ab9025d43f60a31b32a82e10936f07484246","crypto":{"ciphertext":"ef9dcce915eeb0c4f7aa2bb16b9ae6ce5a4444b4ed8be45d94e6b7fe7f4f9b47","cipherparams":{"iv":"31b12ef1d308ea1edacc4ab00de80d55"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d06ccd5d9c5d75e1a66a81d2076628f5716a3161ca204d92d04a42c057562541","n":8192,"r":8,"p":1},"mac":"2c30bc373c19c5b41385b85ffde14b9ea9f0f609c7812a10fdcb0a565034d9db"}},
  "uploaders": {
    "root": {
      "swarm": {}
    }
  }
}
```

```sh
$ curl -X POST localhost:8000/account -H 'Content-Type: application/json' --data @create-account.json

# These values are generated and will be different
{"accountId":"aa43edaf8266e8f8","accessKey":"usgq6tSBW+wDYA/MBF367HnNp4tGKaCTRPy3JHPEqJmFBuxq1sA7UhFOpuV80ngC"}
```

### Create hotel

This is just an example data that we know will pass all the validations. For a better
description of the actual data model, have a look at `src/services/validators/`,
where you will find JSON schemas used to validate incoming data.

```json
{
  "description": {
    "name": "Random hotel",
    "description": "**Beautiful** hotel located in the center of _Prague, Czech Republic_.",
    "location": {
      "latitude": 50.075388,
      "longitude": 14.414170
    },
    "contacts": {
      "general": {
        "email": "chadima.jiri@gmail.com",
        "phone": "00420224371111",
        "url": "https://jirkachadima.cz",
        "ethereum": "windingtree.eth"
      }
    },
    "address": {
      "line1": "Rašínovo nábřeží 1981/80",
      "line2": "Nové Město",
      "postalCode": "12000",
      "city": "Prague",
      "country": "CZ"
    },
    "timezone": "Europe/Prague",
    "currency": "CZK",
    "amenities": [],
    "images": [
      "https://raw.githubusercontent.com/windingtree/media/master/logo-variants/tree/png/tree--gradient-on-white.png",
      "https://raw.githubusercontent.com/windingtree/media/master/logo-variants/full-logo/png/logo--black-on-green.png"
    ],
    "updatedAt": "2018-06-19T15:53:00+0200",
    "roomTypes": {
      "1234-abcd": {
        "name": "string",
        "description": "string",
        "totalQuantity": 0,
        "occupancy": {
          "min": 1,
          "max": 3
        },
        "amenities": [
          "TV"
        ],
        "images": [
          "https://raw.githubusercontent.com/windingtree/media/web-assets/logo-variants/full-logo/png/logo--white.png"
        ],
        "updatedAt": "2018-06-27T14:59:05.830Z",
        "properties": {
          "nonSmoking": "some"
        }
      }
    }
  }
}
```

```sh
$ curl -X POST localhost:8000/hotels -H 'Content-Type: application/json' \
  -H 'X-Access-Key: usgq6tSBW+wDYA/MBF367HnNp4tGKaCTRPy3JHPEqJmFBuxq1sA7UhFOpuV80ngC' \
  -H 'X-Wallet-Password: windingtree' \
  --data @hotel-description.json

# This value will be different
{"address":"0xA603FF7EA9A1B81FB45EF6AeC92A323a88211f40"}
```

You can verify that the hotel data was saved by calling
```sh
$ curl localhost:8000/hotels/0xa8c4cbB500da540D9fEd05BE7Bef0f0f5df3e2cc
```
