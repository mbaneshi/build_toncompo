import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { CompoTon } from '../wrappers/CompoTon';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('CompoTon', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CompoTon');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let compoTon: SandboxContract<CompoTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        compoTon = blockchain.openContract(
            CompoTon.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await compoTon.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: compoTon.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and compoTon are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await compoTon.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await compoTon.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: compoTon.address,
                success: true,
            });

            const counterAfter = await compoTon.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
