#!/bin/bash
set -e

echo "Starting automated provisioning..."
export DEBIAN_FRONTEND=noninteractive

# Fix any interrupted apt processes
sudo dpkg --configure -a

# Update and Upgrade
echo "Updating packages..."
sudo apt-get update
sudo apt-get upgrade -yq -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# Add 2GB Swap Space
echo "Configuring Swap Space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space configured successfully."
else
    echo "Swapfile already exists."
fi

# Install Dependencies
echo "Installing dependencies..."
sudo apt-get install -yq unzip curl wget debian-keyring debian-archive-keyring apt-transport-https iptables-persistent netfilter-persistent

# Install PocketBase (AMD64)
echo "Installing PocketBase..."
if [ ! -f /usr/local/bin/pocketbase ]; then
    wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.25/pocketbase_0.22.25_linux_amd64.zip
    unzip pocketbase_0.22.25_linux_amd64.zip
    sudo mv pocketbase /usr/local/bin/
    sudo chmod +x /usr/local/bin/pocketbase
    sudo mkdir -p /pb_data
    rm pocketbase_0.22.25_linux_amd64.zip
    echo "PocketBase installed successfully."
fi

# Install Caddy
echo "Installing Caddy..."
if ! command -v caddy &> /dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt-get update
    sudo apt-get install caddy -yq
    echo "Caddy installed successfully."
fi

# Configure Firewall (Oracle Cloud specific)
echo "Configuring iptables for port 80 and 443..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

echo "Provisioning completed successfully!"
