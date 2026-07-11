import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

interface PageHeaderCtx {
  headerRight: ReactNode
  setHeaderRight: (node: ReactNode) => void
}

const PageHeaderContext = createContext<PageHeaderCtx>({
  headerRight: null,
  setHeaderRight: () => {},
})

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerRight, setHeaderRight] = useState<ReactNode>(null)
  const set = useCallback((node: ReactNode) => setHeaderRight(node), [])
  return (
    <PageHeaderContext.Provider value={{ headerRight, setHeaderRight: set }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeader() {
  return useContext(PageHeaderContext)
}
