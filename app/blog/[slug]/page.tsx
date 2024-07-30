import { buttonVariants } from '@/components/ui/button';
import PageWrapper from '@/components/wrapper/page-wrapper';
import config from '@/config';
import { cn } from '@/lib/utils';
import { getBlogSlug } from '@/utils/functions/blog/get-blog-slug';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReactHtmlParser from 'react-html-parser';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const info = await fetch(`https://tsafi.xyz/api/blog/${process.env.BLOG_SITE_ID}/${params?.slug}`, {
      method: "POST",
      headers: {
        "X-Auth-Key": process.env.CMS_API_KEY!,
      },
    });

    if (!info.ok) {
      throw new Error(`API request failed with status ${info.status}`);
    }

    const contentType = info.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid content type received from API");
    }

    const { response } = await info.json();

    if (!response || response.length === 0) {
      return {
        title: "Not Found",
        description: "The page you are looking for does not exist"
      };
    }

    return {
      openGraph: {
        title: response[0]?.title,
        description: response[0]?.subtitle,
        images: [response[0]?.image],
      },
      keywords: [...response[0]?.keywords]
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      title: "Error",
      description: "An error occurred while fetching the page content"
    };
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(
      "https://tsafi.xyz/api/blog/slugs",
      {
        method: "GET",
        headers: {
          "X-Auth-Key": process.env.CMS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 200 || result.message !== "success") {
      throw new Error(`API error: ${result.message}`);
    }

    if (!Array.isArray(result.response)) {
      console.warn('Unexpected response structure:', result);
      return [];
    }

    return result.response.map((post: { slug: string }) => ({
      slug: post.slug,
    }));

  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default async function Blog({ params }: { params: { slug: string } }) {

  if (!config?.features?.blog) {
    redirect("/")
  }

  const { response } = await getBlogSlug(params?.slug, process.env.BLOG_SITE_ID!)

  return (
    <PageWrapper>
      <article className="container relative max-w-3xl py-6 lg:py-10">
        <Link
          href="/blog"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute left-[-200px] top-14 hidden xl:inline-flex"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          See all posts
        </Link>
        <div>
          <p
            className="block text-sm text-muted-foreground"
          >
            Published on {new Date(response?.[0]?.created_at).toLocaleDateString()}
          </p>
          <h1 className="scroll-m-20 text-3xl font-bold pt-4 tracking-tight lg:text-3xl">
            {response?.[0]?.title}
          </h1>
          <div className="mt-4 flex items-center space-x-3">
            <Image
              src={response?.[0]?.author?.author_profile_img}
              alt={""}
              width={42}
              height={42}
              className="rounded-full bg-white"
            />
            <div className="flex flex-col text-left leading-tight">
              <p className="font-medium">
                {response?.[0]?.author?.author_name}
              </p>
              <Link href={`https://www.instagram.com/${response?.[0]?.author?.author_twitter}`} target='_blank'>
                <p className='text-xs dark:text-gray-200 text-gray-500 font-semibold hover:underline hover:cursor-pointer'>@{response?.[0]?.author?.author_twitter}</p>
              </Link>
            </div>
          </div>
        </div>
        <Image
          src={response?.[0]?.image}
          alt={""}
          width={720}
          height={405}
          className="my-8 rounded-md border bg-muted transition-colors"
          priority
        />
        {ReactHtmlParser(response?.[0]?.blog_html, {
          transform: transformNode
        })}
        <hr className="mt-12" />
        <div className="flex justify-center py-6 lg:py-10">
          <Link href="/blog" className={cn(buttonVariants({ variant: "ghost" }))}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            See all posts
          </Link>
        </div>
      </article>
      <></>
    </PageWrapper>
  )
}

const transformNode = (node: any) => {
  // Applying classes to paragraph tags
  if (node.type === "tag" && node.name === "p") {
    let className = "leading-7 mt-6";
    if (node.attribs.class) {
      className = `${node.attribs.class} ${className}`;
    }
    node.attribs.class = className;
  }

  // Example for adding classes to anchor tags
  if (node.type === "tag" && node.name === "a") {
    node.attribs.class =
      "font-medium text-primary underline underline-offset-4";
  }

  // Add more conditions for other tags as needed
  // Example for adding classes to anchor tags
  if (node.type === "tag" && node.name === "h1") {
    node.attribs.class =
      "scroll-m-20 text-2xl font-extrabold pt-4 tracking-tight lg:text-3xl";
  }

  if (node.type === "tag" && node.name === "h2") {
    node.attribs.class =
      "mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0";
  }

  if (node.type === "tag" && node.name === "h3") {
    node.attribs.class =
      "mt-8 scroll-m-20 text-lg font-semibold tracking-tight";
  }
};
