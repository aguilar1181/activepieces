import { logger } from '@activepieces/server-shared'
import { apId, FlowId, ProjectId } from '@activepieces/shared'
import { repoFactory } from '../core/db/repo-factory'
import {
    AppEventRouting,
    AppEventRoutingEntity,
} from './app-event-routing.entity'

const appEventRoutingRepo = repoFactory(
    AppEventRoutingEntity,
)

export const appEventRoutingService = {
    async listListeners({
        appName,
        event,
        identifierValue,
    }: {
        appName: string
        event: string
        identifierValue: string
    }): Promise<AppEventRouting[]> {
        return appEventRoutingRepo().findBy({ appName, event, identifierValue })
    },
    async createListeners({
        appName,
        events,
        identifierValue,
        flowId,
        projectId,
    }: {
        appName: string
        events: string[]
        identifierValue: string
        flowId: FlowId
        projectId: ProjectId
    }): Promise<void> {
        logger.info(
            `Creating listeners for ${appName}, events=${events}, identifierValue=${identifierValue}`,
        )
        const upsertCommands: Promise<unknown>[] = []
        events.forEach((event) => {
            const upsert = appEventRoutingRepo().upsert(
                {
                    id: apId(),
                    appName,
                    event,
                    identifierValue,
                    flowId,
                    projectId,
                },
                ['appName', 'event', 'identifierValue', 'projectId'],
            )
            upsertCommands.push(upsert)
        })
        await Promise.all(upsertCommands)
    },
    async deleteListeners({
        projectId,
        flowId,
    }: {
        projectId: ProjectId
        flowId: FlowId
    }): Promise<void> {
        await appEventRoutingRepo().delete({
            projectId,
            flowId,
        })
    },
}
