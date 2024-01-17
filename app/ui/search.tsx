'use client'; // 이 컴포넌트는 클라이언트 컴포넌트 내에서 프로그래밍 방식으로 경로를 탐색할 수 있습니다. 여러 가지 방법을 사용할 수 있습니다.

import { useDebouncedCallback } from 'use-debounce';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // useSearchParams는 현재 URL의 검색 파라미터를 가져오는 React Hook입니다. 이를 이용해 현재 URL에서 검색 파라미터를 가져와 searchParams에 저장
  const pathname = usePathname(); // usePathname은 현재 URL의 경로명을 가져오는 React Hook입니다. 이를 이용해 현재 URL의 경로명을 가져와 pathname에 저장
  const { replace } = useRouter(); // useRouter는 Next.js의 라우터 객체를 가져오는 Hook : replace 함수만 가져와 사용 / replace 함수는 현재 URL을 새 URL로 교체하는 역할

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);

    params.set('page', '1');

    if (term) {
      params.set('query', term); // term이 존재하는 경우, query라는 키에 term을 값으로 설정합니다. 즉, 검색어를 URL의 검색 파라미터에 추가
    } else {
      params.delete('query'); // term이 존재하지 않는 경우, query라는 키를 삭제합니다. 즉, 검색어를 URL의 검색 파라미터에서 제거
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      handleSearch(queryParam);
    }
  }, [searchParams, handleSearch]);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
