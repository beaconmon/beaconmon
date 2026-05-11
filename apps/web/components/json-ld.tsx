export function JsonLd({ data }: { data: object | object[] }) {
  // Escape </script> to prevent breaking out of the script tag
  const json = JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
