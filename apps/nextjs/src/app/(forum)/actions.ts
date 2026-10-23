'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getForumContext } from '@/lib/forum';
import { ForumError } from '@/lib/forum-store';
import type { ForumActionResult } from '@/types/forum';

export async function forumAction(form: FormData): Promise<ForumActionResult> {
  try {
    const { store, viewer } = await getForumContext();
    if (!store) return { error: 'The forum database is not configured yet.' };
    if (!viewer)
      return { error: 'Your session has ended. Log in again to participate.' };
    const input = Object.fromEntries(form.entries());
    let location: string | undefined;
    let success = 'Saved.';
    switch (input.action) {
      case 'post': {
        const id = await store.createPost(viewer, input);
        location = `/item/${id}`;
        break;
      }
      case 'comment': {
        const id = await store.createComment(viewer, {
          ...input,
          parentId: input.parentId || undefined,
        });
        location = `/item/${input.postId}#comment-${id}`;
        success = 'Comment posted.';
        break;
      }
      case 'vote':
        await store.vote(viewer, { ...input, voted: input.voted === 'true' });
        break;
      case 'edit':
        await store.edit(viewer, input);
        break;
      case 'delete':
        await store.remove(viewer, input);
        success = 'Deleted.';
        break;
      case 'report':
        await store.report(viewer, input);
        success = 'Report received. Thank you.';
        break;
      case 'moderate':
        await store.moderate(viewer, {
          ...input,
          reportId: input.reportId || undefined,
        });
        break;
      default:
        return { error: 'Unknown forum action.' };
    }
    revalidatePath('/(forum)', 'layout');
    return { success, location };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { error: error.issues[0]?.message ?? 'Check your input.' };
    if (error instanceof ForumError) return { error: error.message };
    // Keep database errors, statements, and account information out of responses.
    console.error(
      'Forum action failed',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return {
      error:
        'Could not save your changes. Your draft is still here. Please try again.',
    };
  }
}
