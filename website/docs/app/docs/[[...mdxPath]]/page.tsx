import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "@/mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);

  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://nuwa.dev/docs/${params.mdxPath?.join("/") || ""}`,
      type: "article",
      images: ["https://nuwa.dev/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: ["https://nuwa.dev/og-image.png"],
    },
  };
}

const Wrapper = getMDXComponents({}).wrapper;

export default async function Page(props) {
  const params = await props.params;
  const result = await importPage(params.mdxPath);
  const { default: MDXContent, toc, metadata } = result;
  return (
    <div className="w-full mx-auto px-4">
      <Wrapper toc={toc} metadata={metadata}>
        {metadata?.title && (
          <>
            <h1 className="text-4xl text-black font-bold mt-4 dark:text-white">
              {metadata.title}
            </h1>
            <div className="overflow-x-auto mt-4 -ml-6">
              <table className="table-auto border-separate border-spacing-x-6">
                <thead>
                  <tr>
                    {[
                      "nip",
                      "status",
                      "type",
                      "category",
                      "created",
                      "requires",
                    ]
                      .filter((field) => metadata?.[field])
                      .map((field) => (
                        <th
                          key={field}
                          className="text-xs text-gray-500 font-medium pb-1 text-left dark:text-gray-400"
                        >
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[
                      "nip",
                      "status",
                      "type",
                      "category",
                      "created",
                      "requires",
                    ]
                      .filter((field) => metadata?.[field])
                      .map((field) => (
                        <td
                          key={field}
                          className="text-base text-gray-700 text-left dark:text-gray-200"
                        >
                          {metadata[field]}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        <MDXContent {...props} params={params} />
      </Wrapper>
    </div>
  );
}
