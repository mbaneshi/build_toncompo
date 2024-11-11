import { toNano } from '@ton/core';
import { CompoTon } from '../wrappers/CompoTon';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const compoTon = provider.open(
        CompoTon.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('CompoTon')
        )
    );

    await compoTon.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(compoTon.address);

    console.log('ID', await compoTon.getID());
}
