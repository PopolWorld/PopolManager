# PopolManager

A system to manage servers, designed to work for PopolWorld.

## Environment variables

Variables to set in a `.env` file:

| Name        | Description                                            | Default value     |
| ----------- | ------------------------------------------------------ | ----------------- |
| DB_HOST     | MySQL database host                                    |                   |
| DB_NAME     | MySQL database name                                    |                   |
| DB_USERNAME | MySQL user name                                        |                   |
| DB_PASSWORD | MySQL user password                                    |                   |
| API_SCHEME  | Scheme for server endpoints (http or https) (optional) | https             |
| API_HOST    | Custom host for server endpoints (optional)            | api.popolworld.fr |

## Start and stop the service

To start the service:

```bash
sh start.sh
```

To stop the service:

```
screen -r popolworld
CTRL+C
```
