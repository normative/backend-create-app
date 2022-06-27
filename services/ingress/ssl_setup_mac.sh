SSL_DIR=.localhost-ssl
mkdir -p $SSL_DIR
openssl req -x509 -newkey rsa:4096 -nodes -keyout $SSL_DIR/localhost.key -days 365 -out $SSL_DIR/localhost.crt -extensions req_ext -config ssl.conf -subj '/CN=localhost/O=normative/C=CA/L=Calgary/OU=Client'

sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $SSL_DIR/localhost.crt
