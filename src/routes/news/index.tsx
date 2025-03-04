import {
  component$,
  noSerialize,
  Resource,
  useResource$,
  useStylesScoped$,
} from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import type { ListResult, NewsEntry } from '~/types'
import NewsTile from '~/components/news/news-tile'
import styles from '~/css/news/index.css?inline'
import pb from '~/pocketbase'
import Pagination from '~/components/elements/pagination'
import usePagination from '~/hooks/usePagination'

export default component$(() => {
  useStylesScoped$(styles)

  const pagination = usePagination(1, 30)
  const newsResource = useResource$<ListResult<NewsEntry>>(
    async ({ track }) => {
      track(() => pagination.page.value)

      const response = await pb
        .collection('news')
        .getList<NewsEntry>(pagination.page.value, pagination.perPage.value)
      pagination.setTotalPages(response.totalPages)
      noSerialize(response)
      return response
    }
  )

  return (
    <article>
      <Pagination {...pagination} />
      <Resource
        value={newsResource}
        onPending={() => <>Loading...</>}
        onRejected={(error) => <>Error: {error.message}</>}
        onResolved={(news) => (
          <div
            class={[
              'news__container',
              pagination.totalPages.value > 1 && 'my-5',
            ]}
          >
            {news.items.map((newsEntry) => (
              <NewsTile key={newsEntry.id} {...newsEntry} />
            ))}
          </div>
        )}
      />
      <Pagination {...pagination} />
    </article>
  )
})

export const head: DocumentHead = {
  title: 'OST eSports - News',
}
