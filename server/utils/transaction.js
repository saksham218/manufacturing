import mongoose from 'mongoose';

const MAX_RETRIES = 3;

export const runInTransaction = async (operation) => {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await operation(session);
        }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
        return result;
    } finally {
        session.endSession();
    }
};

export const runWithOptimisticLock = async (operation) => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await operation();
        } catch (err) {
            if (err instanceof mongoose.Error.VersionError && attempt < MAX_RETRIES - 1) continue;
            throw err;
        }
    }
};
