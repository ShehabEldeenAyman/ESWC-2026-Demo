# LDES-WebAPP-Backend

Running instructions.

Oxigraph:

./oxigraph serve --location ./oxigraph_data_1 --bind 127.0.0.1:7878
./oxigraph serve --location ./oxigraph_data_2 --bind 127.0.0.1:7879
./oxigraph serve --location ./oxigraph_data_3 --bind 127.0.0.1:7877

Virtuoso: Virtuoso Services Control
sudo systemctl start virtuoso-opensource
sudo systemctl start virtuoso-opensource-7
sudo systemctl status virtuoso-opensource-7


Postgres: PG Admin
sudo systemctl start postgresql

Redis:(WSL)
sudo service redis-server start

Backend:
npm run dev

Ngrok:
ngrok http [port_number]