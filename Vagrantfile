$script = <<SCRIPT
echo I am provisioning...
date > /etc/vagrant_provisioned_at
apt-get -y update
apt-get -y install git zsh curl vim htop
apt-get -y install nodejs npm
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
npm install --no-bin-links
npm install -g typescript concurrently lite-server
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"

  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

  config.vm.hostname = "tour-of-heroes"
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 3001, host: 3001

  config.vm.provision "shell", inline: $script
end
