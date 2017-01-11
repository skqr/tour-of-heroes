import {Injectable} from '@angular/core';
import {ModelResource, ModelResMap,
        ResModelHydratorProvider, ResModelHydrator} from './jsonApi.service';
import {Manufacturer, MotherboardProdModel, ProcessorProdModel, RamProdModel,
        NetworkAdapterProdModel, StorageProdModel, AudioAdapterProdModel,
        VideoAdapterProdModel} from '../models/catalogue';
import {Computer, Location, Person, Motherboard} from '../models/assets';
import {OS, OSInfo, NetworkAdapter} from '../models/os';
import {JsonApiResObj} from '../models/jsonApi';
import _ = require('lodash');


class PersonResMap implements ModelResource {
    public model: any = Person;

    public map: ModelResMap = {
        properties: {
            name: 'name'
        }
    };
}


class LocationResMap implements ModelResource {
    public model: any = Location;

    public map: ModelResMap = {
        properties: {
            name: 'name'
        }
    };
}


class ManufacturerResMap implements ModelResource {
    public model: any = Manufacturer;

    public map: ModelResMap = {
        properties: {
            name: 'name'
        }
    };
}


class ComputerResMap implements ModelResource {
    public model: any = Computer;

    public map: ModelResMap = {
        relationships: {
            toOne: {
                location: 'location',
                owner: 'owner',
                motherboard: 'mother'
            },
            toMany: {
                cpus: 'cpus',
                ramModules: 'ram_modules',
                storages: 'storages',
                videoAdapters: 'video_adapters',
                audioAdapters: 'audio_adapters',
                osinfos: 'osinfo_set'
            }
        }
    };
}


class MotherboardResMap implements ModelResource {
    public model: any = Motherboard;

    public map: ModelResMap = {
        relationships: {
            toOne: {
                prodModel: 'specs'
            }
        }
    };
}


class MotherboardProdModelResMap implements ModelResource {
    public model: any = MotherboardProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
            chassis: 'chassis'
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


class ProcessorProdModelResMap implements ModelResource {
    public model: any = ProcessorProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
            cores: 'cores',
            frequency: 'frequency'
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


class RamProdModelResMap implements ModelResource {
    public model: any = RamProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
            capacity: 'capacity',
            frequency: 'speed',
            deviceType: 'device_type'
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


class StorageProdModelResMap implements ModelResource {
    public model: any = StorageProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
            capacity: 'capacity',
            deviceType: 'device_type'
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


class VideoAdapterProdModelResMap implements ModelResource {
    public model: any = VideoAdapterProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
            capacity: 'memory'
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


class AudioAdapterProdModelResMap implements ModelResource {
    public model: any = AudioAdapterProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


class OSInfoResMap implements ModelResource {
    public model: any = OSInfo;

    public map: ModelResMap = {
        properties: {
            productKey: 'product_key',
            hostname: 'hostname'
        },
        relationships: {
            toMany: {
                // os: 'os',
                networkAdapters: 'network'
            }
        }
    };
}


class NetworkAdapterResMap implements ModelResource {
    public model: any = NetworkAdapter;

    public map: ModelResMap = {
        properties: {
            deviceId: 'device_id',
            speed: 'speed',
            defaultAdapter: 'default',
            mac: 'mac',
            ipv4Address: 'ip4_address',
            ipv4Netmask: 'ip4_netmask',
            ipv6Address: 'ip6_address',
            ipv6Netmask: 'ip6_netmask'
        },
        relationships: {
            toOne: {
                prodModel: 'nic'
            }
        }
    };
}


class NetworkAdapterProdModelResMap implements ModelResource {
    public model: any = NetworkAdapterProdModel;

    public map: ModelResMap = {
        properties: {
            name: 'model',
            deviceType: 'device_type'
        },
        relationships: {
            toOne: {
                manufacturer: 'manufacturer'
            }
        }
    };
}


@Injectable()
export class AssetsResModelHydratorProvider implements ResModelHydratorProvider {
    private resources: {[resType: string]: ModelResource} = {
        'person': new PersonResMap(),
        'location': new LocationResMap(),
        'manufacturer': new ManufacturerResMap(),
        'computer': new ComputerResMap(),
        'motherboard': new MotherboardResMap(),
        'motherboard-model': new MotherboardProdModelResMap(),
        'cpu-model': new ProcessorProdModelResMap(),
        'ram-module-model': new RamProdModelResMap(),
        'storage-model': new StorageProdModelResMap(),
        'audio-adapter-model': new AudioAdapterProdModelResMap(),
        'video-adapter-model': new VideoAdapterProdModelResMap(),
        'osinfo': new OSInfoResMap(),
        // 'os': new OSResMap(),
        'network-adapter': new NetworkAdapterResMap(),
        'network-adapter-model': new NetworkAdapterProdModelResMap()
    };

    public getHydrator(resType: string): ResModelHydrator {
        if (resType == "assets") resType = "computer";  // TODO: Unificar los tipos.

        if (resType in this.resources) return new ResModelHydrator(this.resources[resType]);  // Or null.
    }
}
