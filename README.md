# RDF-form-viewer
Implementace diplomové práce
# Návod k nasazení
Tato kapitola popisuje návod k nasazení, resp. lokálnímu spuštění, vytvořené aplikace.

## Prerekvizity
* Docker
* git

## Server
Pro úplné fungování aplikace byl použit server OFN Record Manager, který je k dispozici na adrese [https://github.com/blcham/record-manager](https://github.com/blcham/record-manager).
Pro spuštění serveru je třeba využít postup, který je přístupný na adrese [https://github.com/blcham/vfn-data-management](https://github.com/blcham/vfn-data-management).

## Mobilní aplikace
Aplikaci je možné stáhnout na adrese [https://github.com/Prukes/RDF-form-viewer](https://github.com/Prukes/RDF-form-viewer).
Nejjednodušší postup pro spuštění aplikace je využití Dockeru. Aplikace obsahuje Dockerfile společně s docker-compose.yml.

### Postup
Pro spuštění aplikace pomocí Dockeru postupujte následovně.

1. stáhnout repositář pomocí `git clone https://github.com/Prukes/RDF-form-viewer.git`
2. přejít do složky ./form-viewer
3. upravit adresu serveru v souboru .env
    * Tento soubor obsahuje proměnnou REACT_APP_API_URL. Tato proměnná je dále v aplikaci použita jako základní (base) URL adresa serveru.
4. spustě příkaz `docker compose --env-file=.env up` v adresáři ./form-viewer
5. aplikace by měla být spuštěna na adrese localhost a portu 10000 (localhost:10000)
